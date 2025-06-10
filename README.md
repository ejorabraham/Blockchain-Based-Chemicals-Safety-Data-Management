# Blockchain-Based Chemicals Safety Data Management

A comprehensive blockchain solution for managing chemical safety data, manufacturer verification, hazard communication, emergency response, and training verification using Clarity smart contracts.

## Overview

This system provides a decentralized platform for chemical safety management with the following key features:

- **Manufacturer Verification**: Register and verify chemical manufacturers
- **Safety Data Management**: Store and manage chemical safety data sheets (SDS)
- **Hazard Communication**: Issue and manage hazard alerts and notifications
- **Emergency Response**: Coordinate emergency incident reporting and response
- **Training Verification**: Track and verify chemical safety training records

## Smart Contracts

### 1. Manufacturer Verification Contract (`manufacturer-verification.clar`)

Manages the registration and verification of chemical manufacturers.

**Key Functions:**
- `register-manufacturer`: Register a new manufacturer
- `verify-manufacturer`: Verify a manufacturer (owner only)
- `get-manufacturer`: Retrieve manufacturer information
- `is-manufacturer-verified`: Check verification status

### 2. Safety Data Contract (`safety-data.clar`)

Manages chemical safety data sheets with comprehensive information about chemicals.

**Key Functions:**
- `create-sds`: Create a new safety data sheet
- `update-sds`: Update existing safety data
- `get-sds`: Retrieve safety data sheet
- `find-sds-by-chemical`: Find SDS by chemical name and CAS number
- `get-hazard-level`: Get hazard level for a chemical

### 3. Hazard Communication Contract (`hazard-communication.clar`)

Handles hazard alerts and communication systems.

**Key Functions:**
- `issue-hazard-alert`: Issue new hazard alerts
- `subscribe-to-alerts`: Subscribe to specific hazard types
- `update-alert-status`: Update alert status
- `get-hazard-alert`: Retrieve alert information

### 4. Emergency Response Contract (`emergency-response.clar`)

Coordinates emergency incident reporting and response team management.

**Key Functions:**
- `report-incident`: Report emergency incidents
- `register-response-team`: Register emergency response teams
- `assign-response-team`: Assign teams to incidents
- `resolve-incident`: Mark incidents as resolved

### 5. Training Verification Contract (`training-verification.clar`)

Manages chemical safety training records and certifications.

**Key Functions:**
- `register-training-provider`: Register training organizations
- `record-training`: Record completed training
- `verify-training`: Verify training records
- `is-training-current`: Check if training is current

## Data Structures

### Manufacturer Data
- Name, license number, contact information
- Verification status and verifier
- Registration date

### Safety Data Sheet
- Chemical name, CAS number
- Manufacturer ID, hazard level
- Physical properties, health hazards
- Precautions, emergency procedures
- Version control and timestamps

### Hazard Alerts
- Chemical name, hazard type
- Severity level, description
- Affected areas, issue date
- Status tracking

### Emergency Incidents
- Chemical involved, incident type
- Location, severity, description
- Response team assignment
- Resolution tracking

### Training Records
- Trainee, course details
- Completion and expiry dates
- Certification level
- Verification status

## Usage Examples

### Register a Manufacturer
\`\`\`clarity
(contract-call? .manufacturer-verification register-manufacturer
"ChemCorp Industries"
"LIC-12345"
"contact@chemcorp.com")
\`\`\`

### Create Safety Data Sheet
\`\`\`clarity
(contract-call? .safety-data create-sds
"Benzene"
"71-43-2"
u1
u3
"Colorless liquid"
"Carcinogenic, flammable"
"Use in ventilated area"
"Evacuate area, call emergency services")
\`\`\`

### Report Emergency Incident
\`\`\`clarity
(contract-call? .emergency-response report-incident
"Benzene"
"spill"
"Building A, Floor 2"
u4
"Large chemical spill in laboratory")
\`\`\`

## Security Features

- **Access Control**: Owner-only functions for critical operations
- **Data Validation**: Input validation for all data entries
- **Version Control**: Tracking of data sheet versions
- **Audit Trail**: Immutable record of all transactions
- **Expiry Tracking**: Automatic tracking of training and certification expiry

## Installation and Deployment

1. Install Clarity CLI tools
2. Deploy contracts in the following order:
    - manufacturer-verification
    - safety-data
    - hazard-communication
    - emergency-response
    - training-verification

3. Initialize contract owner permissions
4. Register initial manufacturers and training providers

## Testing

Run the test suite using Vitest:

\`\`\`bash
npm test
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For technical support or questions, please open an issue in the repository.

