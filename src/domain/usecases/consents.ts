export type RecordConsentParams = {
  termsVersion: string;
  privacyVersion: string;
};

export interface Consents {
  record(params: RecordConsentParams): Promise<void>;
}
