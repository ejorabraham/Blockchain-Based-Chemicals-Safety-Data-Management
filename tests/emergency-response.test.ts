import { describe, it, expect, beforeEach } from 'vitest'

// Mock environment setup
const mockMaps = new Map()
const mockVars = new Map()
let mockBlockHeight = 1000
let mockTxSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'

function mockMapGet(mapName, key) {
  const mapKey = `${mapName}-${JSON.stringify(key)}`
  return mockMaps.get(mapKey) || null
}

function mockMapSet(mapName, key, value) {
  const mapKey = `${mapName}-${JSON.stringify(key)}`
  mockMaps.set(mapKey, value)
}

function mockVarGet(varName) {
  return mockVars.get(varName) || 1
}

function mockVarSet(varName, value) {
  mockVars.set(varName, value)
}

const emergencyResponse = {
  reportIncident: (chemicalInvolved, incidentType, location, severity, description) => {
    const incidentId = mockVarGet('next-incident-id')
    
    // Validate severity
    if (severity > 5 || severity < 1) {
      return { error: 500 }
    }
    
    const incidentData = {
      'chemical-involved': chemicalInvolved,
      'incident-type': incidentType,
      location,
      severity,
      description,
      'reported-by': mockTxSender,
      'report-time': mockBlockHeight,
      status: 'reported',
      'response-team': null,
      'resolution-time': null
    }
    
    mockMapSet('emergency-incidents', { 'incident-id': incidentId }, incidentData)
    mockVarSet('next-incident-id', incidentId + 1)
    
    return { success: incidentId }
  },
  
  registerResponseTeam: (teamName, specialization) => {
    const teamId = mockVarGet('next-team-id')
    
    const teamData = {
      'team-name': teamName,
      'lead-contact': mockTxSender,
      specialization,
      availability: true,
      'response-count': 0
    }
    
    mockMapSet('response-teams', { 'team-id': teamId }, teamData)
    mockVarSet('next-team-id', teamId + 1)
    
    return { success: teamId }
  },
  
  assignResponseTeam: (incidentId, teamId) => {
    const incidentData = mockMapGet('emergency-incidents', { 'incident-id': incidentId })
    if (!incidentData) {
      return { error: 401 } // err-not-found
    }
    
    const teamData = mockMapGet('response-teams', { 'team-id': teamId })
    if (!teamData) {
      return { error: 401 } // err-not-found
    }
    
    if (!teamData.availability) {
      return { error: 503 } // team not available
    }
    
    // Update incident
    const updatedIncident = {
      ...incidentData,
      'response-team': teamData['lead-contact'],
      status: 'responding'
    }
    mockMapSet('emergency-incidents', { 'incident-id': incidentId }, updatedIncident)
    
    // Update team
    const updatedTeam = {
      ...teamData,
      availability: false,
      'response-count': teamData['response-count'] + 1
    }
    mockMapSet('response-teams', { 'team-id': teamId }, updatedTeam)
    
    // Create assignment record
    mockMapSet('team-assignments', { 'incident-id': incidentId }, { 'team-id': teamId, 'assigned-time': mockBlockHeight })
    
    return { success: true }
  },
  
  resolveIncident: (incidentId) => {
    const incidentData = mockMapGet('emergency-incidents', { 'incident-id': incidentId })
    if (!incidentData) {
      return { error: 401 } // err-not-found
    }
    
    const updatedIncident = {
      ...incidentData,
      status: 'resolved',
      'resolution-time': mockBlockHeight
    }
    mockMapSet('emergency-incidents', { 'incident-id': incidentId }, updatedIncident)
    
    return { success: true }
  },
  
  getIncident: (incidentId) => {
    return mockMapGet('emergency-incidents', { 'incident-id': incidentId })
  },
  
  getResponseTeam: (teamId) => {
    return mockMapGet('response-teams', { 'team-id': teamId })
  }
}

describe('Emergency Response Contract', () => {
  beforeEach(() => {
    mockMaps.clear()
    mockVars.clear()
    mockVars.set('next-incident-id', 1)
    mockVars.set('next-team-id', 1)
    mockBlockHeight = 1000
    mockTxSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  })
  
  describe('reportIncident', () => {
    it('should successfully report an incident', () => {
      const result = emergencyResponse.reportIncident(
          'Benzene',
          'spill',
          'Building A, Floor 2',
          4,
          'Large chemical spill in laboratory'
      )
      
      expect(result.success).toBe(1)
      
      const incident = emergencyResponse.getIncident(1)
      expect(incident['chemical-involved']).toBe('Benzene')
      expect(incident['incident-type']).toBe('spill')
      expect(incident.severity).toBe(4)
      expect(incident.status).toBe('reported')
      expect(incident['reported-by']).toBe(mockTxSender)
    })
    
    it('should validate severity range', () => {
      const result1 = emergencyResponse.reportIncident('Benzene', 'spill', 'Lab', 6, 'Description')
      expect(result1.error).toBe(500)
      
      const result2 = emergencyResponse.reportIncident('Benzene', 'spill', 'Lab', 0, 'Description')
      expect(result2.error).toBe(500)
    })
    
    it('should increment incident ID', () => {
      const result1 = emergencyResponse.reportIncident('Chemical1', 'spill', 'Lab1', 3, 'Desc1')
      expect(result1.success).toBe(1)
      
      const result2 = emergencyResponse.reportIncident('Chemical2', 'leak', 'Lab2', 2, 'Desc2')
      expect(result2.success).toBe(2)
    })
  })
  
  describe('registerResponseTeam', () => {
    it('should successfully register a response team', () => {
      const result = emergencyResponse.registerResponseTeam(
          'Emergency Response Team Alpha',
          'Chemical spills and leaks'
      )
      
      expect(result.success).toBe(1)
      
      const team = emergencyResponse.getResponseTeam(1)
      expect(team['team-name']).toBe('Emergency Response Team Alpha')
      expect(team.specialization).toBe('Chemical spills and leaks')
      expect(team.availability).toBe(true)
      expect(team['response-count']).toBe(0)
      expect(team['lead-contact']).toBe(mockTxSender)
    })
    
    it('should increment team ID', () => {
      const result1 = emergencyResponse.registerResponseTeam('Team Alpha', 'Spills')
      expect(result1.success).toBe(1)
      
      mockTxSender = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
      const result2 = emergencyResponse.registerResponseTeam('Team Beta', 'Fires')
      expect(result2.success).toBe(2)
    })
  })
  
  describe('assignResponseTeam', () => {
    beforeEach(() => {
      emergencyResponse.reportIncident('Benzene', 'spill', 'Lab A', 4, 'Major spill')
      emergencyResponse.registerResponseTeam('Response Team', 'Chemical incidents')
    })
    
    it('should successfully assign response team to incident', () => {
      const result = emergencyResponse.assignResponseTeam(1, 1)
      expect(result.success).toBe(true)
      
      const incident = emergencyResponse.getIncident(1)
      expect(incident.status).toBe('responding')
      expect(incident['response-team']).toBe(mockTxSender)
      
      const team = emergencyResponse.getResponseTeam(1)
      expect(team.availability).toBe(false)
      expect(team['response-count']).toBe(1)
    })
    
    it('should return error for non-existent incident', () => {
      const result = emergencyResponse.assignResponseTeam(999, 1)
      expect(result.error).toBe(401) // err-not-found
    })
    
    it('should return error for non-existent team', () => {
      const result = emergencyResponse.assignResponseTeam(1, 999)
      expect(result.error).toBe(401) // err-not-found
    })
    
    it('should return error for unavailable team', () => {
      // First assignment
      emergencyResponse.assignResponseTeam(1, 1)
      
      // Report another incident
      emergencyResponse.reportIncident('Toluene', 'leak', 'Lab B', 3, 'Small leak')
      
      // Try to assign same team
      const result = emergencyResponse.assignResponseTeam(2, 1)
      expect(result.error).toBe(503) // team not available
    })
  })
  
  describe('resolveIncident', () => {
    beforeEach(() => {
      emergencyResponse.reportIncident('Benzene', 'spill', 'Lab A', 4, 'Major spill')
    })
    
    it('should successfully resolve an incident', () => {
      mockBlockHeight = 2000
      
      const result = emergencyResponse.resolveIncident(1)
      expect(result.success).toBe(true)
      
      const incident = emergencyResponse.getIncident(1)
      expect(incident.status).toBe('resolved')
      expect(incident['resolution-time']).toBe(2000)
    })
    
    it('should return error for non-existent incident', () => {
      const result = emergencyResponse.resolveIncident(999)
      expect(result.error).toBe(401) // err-not-found
    })
  })
  
  describe('getIncident', () => {
    it('should return incident data', () => {
      emergencyResponse.reportIncident('Benzene', 'spill', 'Lab A', 4, 'Major spill')
      
      const incident = emergencyResponse.getIncident(1)
      expect(incident['chemical-involved']).toBe('Benzene')
      expect(incident.location).toBe('Lab A')
    })
    
    it('should return null for non-existent incident', () => {
      const incident = emergencyResponse.getIncident(999)
      expect(incident).toBeNull()
    })
  })
  
  describe('getResponseTeam', () => {
    it('should return team data', () => {
      emergencyResponse.registerResponseTeam('Team Alpha', 'Chemical spills')
      
      const team = emergencyResponse.getResponseTeam(1)
      expect(team['team-name']).toBe('Team Alpha')
      expect(team.specialization).toBe('Chemical spills')
    })
    
    it('should return null for non-existent team', () => {
      const team = emergencyResponse.getResponseTeam(999)
      expect(team).toBeNull()
    })
  })
})
