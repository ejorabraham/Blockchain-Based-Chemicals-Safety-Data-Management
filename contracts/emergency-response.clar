;; Emergency Response Contract
;; Coordinates chemical emergency responses

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-found (err u401))
(define-constant err-unauthorized (err u402))

;; Data structures
(define-map emergency-incidents
  { incident-id: uint }
  {
    chemical-involved: (string-ascii 100),
    incident-type: (string-ascii 50),
    location: (string-ascii 200),
    severity: uint,
    description: (string-ascii 500),
    reported-by: principal,
    report-time: uint,
    status: (string-ascii 20),
    response-team: (optional principal),
    resolution-time: (optional uint)
  }
)

(define-map response-teams
  { team-id: uint }
  {
    team-name: (string-ascii 100),
    lead-contact: principal,
    specialization: (string-ascii 100),
    availability: bool,
    response-count: uint
  }
)

(define-map team-assignments
  { incident-id: uint }
  { team-id: uint, assigned-time: uint }
)

(define-data-var next-incident-id uint u1)
(define-data-var next-team-id uint u1)

;; Report emergency incident
(define-public (report-incident
  (chemical-involved (string-ascii 100))
  (incident-type (string-ascii 50))
  (location (string-ascii 200))
  (severity uint)
  (description (string-ascii 500))
)
  (let ((incident-id (var-get next-incident-id)))
    (asserts! (<= severity u5) (err u500))
    (asserts! (>= severity u1) (err u500))

    (map-set emergency-incidents
      { incident-id: incident-id }
      {
        chemical-involved: chemical-involved,
        incident-type: incident-type,
        location: location,
        severity: severity,
        description: description,
        reported-by: tx-sender,
        report-time: block-height,
        status: "reported",
        response-team: none,
        resolution-time: none
      }
    )

    (var-set next-incident-id (+ incident-id u1))
    (ok incident-id)
  )
)

;; Register response team
(define-public (register-response-team
  (team-name (string-ascii 100))
  (specialization (string-ascii 100))
)
  (let ((team-id (var-get next-team-id)))
    (map-set response-teams
      { team-id: team-id }
      {
        team-name: team-name,
        lead-contact: tx-sender,
        specialization: specialization,
        availability: true,
        response-count: u0
      }
    )

    (var-set next-team-id (+ team-id u1))
    (ok team-id)
  )
)

;; Assign response team to incident
(define-public (assign-response-team (incident-id uint) (team-id uint))
  (match (map-get? emergency-incidents { incident-id: incident-id })
    incident-data
    (match (map-get? response-teams { team-id: team-id })
      team-data
      (begin
        (asserts! (get availability team-data) (err u503))
        (map-set emergency-incidents
          { incident-id: incident-id }
          (merge incident-data {
            response-team: (some (get lead-contact team-data)),
            status: "responding"
          })
        )
        (map-set team-assignments
          { incident-id: incident-id }
          { team-id: team-id, assigned-time: block-height }
        )
        (map-set response-teams
          { team-id: team-id }
          (merge team-data {
            availability: false,
            response-count: (+ (get response-count team-data) u1)
          })
        )
        (ok true)
      )
      err-not-found
    )
    err-not-found
  )
)

;; Resolve incident
(define-public (resolve-incident (incident-id uint))
  (match (map-get? emergency-incidents { incident-id: incident-id })
    incident-data
    (begin
      (map-set emergency-incidents
        { incident-id: incident-id }
        (merge incident-data {
          status: "resolved",
          resolution-time: (some block-height)
        })
      )
      (ok true)
    )
    err-not-found
  )
)

;; Get incident details
(define-read-only (get-incident (incident-id uint))
  (map-get? emergency-incidents { incident-id: incident-id })
)

;; Get response team details
(define-read-only (get-response-team (team-id uint))
  (map-get? response-teams { team-id: team-id })
)
