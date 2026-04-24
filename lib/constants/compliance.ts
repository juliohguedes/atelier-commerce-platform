export  const  COMPLIANCE_VERSIONS  =  {
    privacyPolicy:  "2026-04",
    termsAndConditions:  "2026-04",
    tailoredOrderTerms:  "2026-04",
    accountDeletionFlow:  "2026-04"
}  as  const;

export  const  CONSENT_SLUGS  =  {
    privacyPolicy:  "privacy_policy",
    termsAndConditions:  "terms_and_conditions",
    tailoredOrderTerms:  "tailored_order_terms",
    estimateAcknowledgement:  "estimate_acknowledgement",
    accountDeletionRequest:  "account_deletion_request"
}  as  const;

export  type  ConsentSlug  =  (typeof  CONSENT_SLUGS)[keyof  typeof  CONSENT_SLUGS];
