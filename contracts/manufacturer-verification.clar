;; Chemical Manufacturer Verification Contract
;; Manages registration and verification of chemical manufacturers

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

;; Data structures
(define-map manufacturers
  { manufacturer-id: uint }
  {
    name: (string-ascii 100),
    license-number: (string-ascii 50),
    contact-info: (string-ascii 200),
    verified: bool,
    registration-date: uint,
    verifier: principal
  }
)

(define-map manufacturer-by-principal
  { manufacturer: principal }
  { manufacturer-id: uint }
)

(define-data-var next-manufacturer-id uint u1)

;; Register a new manufacturer
(define-public (register-manufacturer (name (string-ascii 100)) (license-number (string-ascii 50)) (contact-info (string-ascii 200)))
  (let ((manufacturer-id (var-get next-manufacturer-id)))
    (asserts! (is-none (map-get? manufacturer-by-principal { manufacturer: tx-sender })) err-already-exists)
    (map-set manufacturers
      { manufacturer-id: manufacturer-id }
      {
        name: name,
        license-number: license-number,
        contact-info: contact-info,
        verified: false,
        registration-date: block-height,
        verifier: contract-owner
      }
    )
    (map-set manufacturer-by-principal
      { manufacturer: tx-sender }
      { manufacturer-id: manufacturer-id }
    )
    (var-set next-manufacturer-id (+ manufacturer-id u1))
    (ok manufacturer-id)
  )
)

;; Verify a manufacturer (owner only)
(define-public (verify-manufacturer (manufacturer-id uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (match (map-get? manufacturers { manufacturer-id: manufacturer-id })
      manufacturer-data
      (begin
        (map-set manufacturers
          { manufacturer-id: manufacturer-id }
          (merge manufacturer-data { verified: true, verifier: tx-sender })
        )
        (ok true)
      )
      err-not-found
    )
  )
)

;; Get manufacturer info
(define-read-only (get-manufacturer (manufacturer-id uint))
  (map-get? manufacturers { manufacturer-id: manufacturer-id })
)

;; Get manufacturer ID by principal
(define-read-only (get-manufacturer-id (manufacturer principal))
  (map-get? manufacturer-by-principal { manufacturer: manufacturer })
)

;; Check if manufacturer is verified
(define-read-only (is-manufacturer-verified (manufacturer-id uint))
  (match (map-get? manufacturers { manufacturer-id: manufacturer-id })
    manufacturer-data (get verified manufacturer-data)
    false
  )
)
