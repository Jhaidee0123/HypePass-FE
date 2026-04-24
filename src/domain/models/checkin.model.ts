export type CheckinResult = 'accepted' | 'rejected';

export type CheckinRejectionReason =
  | 'invalid_token'
  | 'token_expired'
  | 'tampered_token'
  | 'wrong_event'
  | 'wrong_session'
  | 'already_checked_in'
  | 'ticket_refunded'
  | 'ticket_voided'
  | 'ticket_transferred'
  | 'ticket_listed'
  | 'session_not_open'
  | 'qr_not_yet_valid'
  | 'ticket_not_found'
  | 'stale_token';

export type ScanResult = {
  result: CheckinResult;
  reason?: CheckinRejectionReason;
  ticket?: {
    id: string;
    eventTitle: string;
    sessionName: string | null;
    sectionName: string;
    ownerName: string | null;
  };
  scannedAt: string;
};
