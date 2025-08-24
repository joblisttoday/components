/**
 * @packageDocumentation JSDoc Type definitions for Job Board Provider APIs
 * This file documents the API endpoints, request/response structures, 
 * and data types for all supported job board providers in the joblist.today system.
 */

/**
 * @typedef JobBoardProvider
 * @property {string} id - Unique identifier for the provider
 * @property {Function} getJobs - Async function to fetch jobs from the provider
 */

/**
 * @typedef BaseJobData
 * @property {string} id - Unique job identifier within the provider
 * @property {string} name - Job title/name
 * @property {string} [description] - Job description content (HTML or plain text)
 * @property {string} url - Direct URL to the job posting
 * @property {string} publishedDate - When the job was published (ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)
 * @property {string} location - Job location (city, country format)
 * @property {string} companyTitle - Company display name
 * @property {string} companyId - Company identifier
 * @property {string} providerId - Provider identifier
 * @property {string} providerHostname - Provider-specific hostname/identifier
 */

/**
 * @typedef GetJobsParams
 * @property {string} hostname - Provider-specific company identifier
 * @property {string} [companyTitle] - Optional company display name override
 * @property {string} [companyId] - Optional company ID override
 * @property {string} [city] - Optional city filter for some providers
 * @property {string} [country] - Optional country filter for some providers
 * @property {string} [language] - Optional language parameter
 */

// =============================================================================
// GREENHOUSE PROVIDER
// =============================================================================

/**
 * @namespace Greenhouse
 * Greenhouse job board API integration
 * @see {@link https://developers.greenhouse.io/job-board.html}
 */

/**
 * @typedef JobLocation
 * @property {string} name - Location name
 */

/**
 * @typedef JobOffice  
 * @property {string} name - Office name
 * @property {string} location - Office location
 */

/**
 * @typedef DataCompliance
 * @property {string} type - Compliance type (e.g., "gdpr")
 * @property {boolean} requires_consent - Whether consent is required
 * @property {boolean} requires_processing_consent - Whether processing consent is required
 * @property {boolean} requires_retention_consent - Whether retention consent is required
 * @property {string|null} retention_period - Data retention period
 * @property {boolean} demographic_data_consent_applies - Whether demographic consent applies
 */

/**
 * @typedef JobMetadata
 * @property {number} id - Metadata field ID
 * @property {string} name - Metadata field name
 * @property {string} value - Metadata field value
 * @property {string} value_type - Type of metadata value
 */

/**
 * @typedef Department
 * @property {number} id - Department ID
 * @property {string} name - Department name
 * @property {number[]} child_ids - Array of child department IDs
 */

/**
 * @typedef ApiJob
 * @property {number} id - Greenhouse job ID
 * @property {string} title - Job title
 * @property {string} content - Job description (HTML format) - only when ?content=true
 * @property {string} absolute_url - Full URL to job posting
 * @property {string} updated_at - ISO 8601 timestamp of last update (YYYY-MM-DDTHH:mm:ss-HH:mm)
 * @property {Greenhouse.JobLocation} location - Primary job location
 * @property {Greenhouse.JobOffice[]} [offices] - List of office locations
 * @property {Greenhouse.DataCompliance[]} data_compliance - Array of compliance requirements
 * @property {number} internal_job_id - Internal Greenhouse job ID
 * @property {Greenhouse.JobMetadata[]} metadata - Array of job metadata
 * @property {string} requisition_id - Job requisition ID
 * @property {string} company_name - Company name
 * @property {string} first_published - ISO 8601 timestamp when first published (YYYY-MM-DDTHH:mm:ss-HH:mm)
 * @property {Greenhouse.Department[]} departments - Array of departments
 */

/**
 * @typedef ApiResponse
 * @property {Greenhouse.ApiJob[]} jobs - Array of job postings
 */

/**
 * Greenhouse API Endpoint
 * @function Greenhouse.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://boards-api.greenhouse.io/v1/boards/{hostname}/jobs?content=true`
 * **Authentication:** None required
 * **Rate Limits:** Not specified in public docs
 * **Features:** 
 * - ✅ Job descriptions included with `content=true` parameter
 * - ✅ Location filtering support
 * - ✅ No additional API calls needed
 */

// =============================================================================
// ASHBY PROVIDER  
// =============================================================================

/**
 * @namespace Ashby
 * Ashby job board API integration
 * @see {@link https://developers.ashbyhq.com/}
 */

/**
 * @typedef JobSecondaryLocation
 * @property {string} locationName - Secondary location name
 */

/**
 * @typedef JobPosting
 * @property {string} id - Ashby job ID (UUID format)
 * @property {string} title - Job title
 * @property {string} locationName - Primary location name
 * @property {string} employmentType - Employment type (Full-time, Part-time, etc.)
 * @property {Ashby.JobSecondaryLocation[]} secondaryLocations - Additional locations
 * @property {string} [publishedDate] - Publication date (added by implementation, not from API)
 * @property {string} [description] - Job description HTML (fetched separately via ApiJobPosting query)
 */

/**
 * @typedef JobDetails
 * @property {string} descriptionHtml - Job description in HTML format
 */

/**
 * @typedef BoardResponse
 * @property {Object} data - GraphQL response wrapper
 * @property {Object} data.jobBoard - Job board data
 * @property {Ashby.JobPosting[]} data.jobBoard.jobPostings - Array of job postings
 */

/**
 * @typedef JobDetailsResponse
 * @property {Object} data - GraphQL response wrapper
 * @property {Ashby.JobDetails} data.jobPosting - Job details
 */

/**
 * Ashby API Endpoints
 * @function Ashby.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoints:** 
 * 1. `POST https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiBoardWithTeams` (job list)
 * 2. `POST https://jobs.ashbyhq.com/api/non-user-graphql` (individual job details)
 * **Authentication:** None required
 * **Rate Limits:** Not specified
 * **Features:**
 * - ✅ Job descriptions via separate GraphQL query for each job
 * - ✅ Multiple locations support
 * - ⚠️ Requires additional API calls for descriptions (one per job)
 * 
 * **GraphQL Queries:**
 * - `ApiBoardWithTeams` - Gets job list without descriptions
 * - `ApiJobPosting` - Gets individual job with `descriptionHtml`
 */

// =============================================================================
// LEVER PROVIDER
// =============================================================================

/**
 * @namespace Lever
 * Lever job board API integration
 * @see {@link https://partnerexperience.lever.co/hc/en-us/articles/5136514106253}
 */

/**
 * @typedef JobCategories
 * @property {string} location - Job location
 * @property {string} [commitment] - Employment type (Full Time, Part Time, etc.)
 * @property {string} [department] - Department name
 * @property {string} [team] - Team name
 * @property {string[]} [allLocations] - Array of all job locations
 */

/**
 * @typedef JobList
 * @property {string} text - List section title
 * @property {string} content - HTML list content
 */

/**
 * @typedef ApiJob
 * @property {string} id - Lever job ID
 * @property {string} text - Job title
 * @property {string} description - Job description (HTML format)
 * @property {string} descriptionPlain - Job description (plain text)
 * @property {string} additional - Additional content (HTML)
 * @property {string} additionalPlain - Additional content (plain text)
 * @property {number} createdAt - Unix timestamp of creation (milliseconds since epoch)
 * @property {string|null} country - Job country
 * @property {string} hostedUrl - URL to job posting
 * @property {string} applyUrl - Direct application URL
 * @property {Lever.JobCategories} categories - Job categorization
 * @property {Lever.JobList[]} [lists] - Array of structured list content
 * @property {string} [workplaceType] - Workplace type (e.g., "hybrid", "remote", "onsite")
 * @property {string} [opening] - Opening section HTML content
 * @property {string} [openingPlain] - Opening section plain text
 * @property {string} [descriptionBody] - Main description body HTML
 * @property {string} [descriptionBodyPlain] - Main description body plain text
 */

/**
 * Lever API Endpoint
 * @function Lever.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://api.lever.co/v0/postings/{hostname}`
 * **Authentication:** None required for public postings
 * **Rate Limits:** Not specified in public docs
 * **Features:**
 * - ✅ Job descriptions included in response (both HTML and plain text)
 * - ✅ Rich metadata (categories, departments, teams)
 * - ✅ No additional API calls needed
 * - ✅ Additional content sections support
 */

// =============================================================================
// SMARTRECRUITERS PROVIDER
// =============================================================================

/**
 * @namespace SmartRecruiters
 * SmartRecruiters API integration
 * @see {@link https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/}
 */

/**
 * @typedef JobLocation
 * @property {string} city - City name
 * @property {string} region - Region code
 * @property {string} country - Country code
 * @property {boolean} remote - Whether job is remote
 * @property {string} latitude - Location latitude
 * @property {string} longitude - Location longitude
 * @property {string} fullLocation - Full formatted location string
 */

/**
 * @typedef Company
 * @property {string} identifier - Company identifier
 * @property {string} name - Company name
 */

/**
 * @typedef Industry
 * @property {string} id - Industry ID
 * @property {string} label - Industry label
 */

/**
 * @typedef CustomField
 * @property {string} fieldId - Custom field ID
 * @property {string} fieldLabel - Custom field label
 * @property {string} valueId - Field value ID
 * @property {string} valueLabel - Field value label
 */

/**
 * @typedef Creator
 * @property {string} name - Creator name
 * @property {string} avatarUrl - Creator avatar URL
 */

/**
 * @typedef JobAdSection
 * @property {string} title - Section title
 * @property {string} text - Section HTML content
 */

/**
 * @typedef JobAd
 * @property {Object} sections - Job ad content sections
 * @property {SmartRecruiters.JobAdSection} [sections.companyDescription] - Company description section
 * @property {SmartRecruiters.JobAdSection} [sections.jobDescription] - Main job description
 * @property {SmartRecruiters.JobAdSection} [sections.qualifications] - Job requirements
 * @property {SmartRecruiters.JobAdSection} [sections.additionalInformation] - Additional details
 */

/**
 * @typedef ApiJob
 * @property {string} id - SmartRecruiters job ID
 * @property {string} name - Job title
 * @property {string} uuid - SmartRecruiters job UUID (different from ID)
 * @property {string} [jobId] - Alternative job ID
 * @property {string} jobAdId - Job advertisement ID
 * @property {boolean} defaultJobAd - Whether this is the default job ad
 * @property {string} refNumber - Reference number
 * @property {SmartRecruiters.Company} company - Company information
 * @property {SmartRecruiters.JobLocation} location - Job location
 * @property {SmartRecruiters.Industry} industry - Industry classification
 * @property {SmartRecruiters.CustomField[]} customField - Array of custom fields
 * @property {string} releasedDate - ISO 8601 timestamp of publication (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @property {SmartRecruiters.Creator} creator - Job creator information
 * @property {Object} [department] - Department information (usually empty object)
 * @property {Object} function - Job function classification
 * @property {string} function.id - Function ID
 * @property {string} function.label - Function label
 * @property {Object} typeOfEmployment - Employment type information
 * @property {string} typeOfEmployment.id - Employment type ID
 * @property {string} typeOfEmployment.label - Employment type label
 * @property {Object} experienceLevel - Experience level information
 * @property {string} experienceLevel.id - Experience level ID
 * @property {string} experienceLevel.label - Experience level label
 * @property {string} visibility - Job visibility status ("PUBLIC", "PRIVATE", etc.)
 * @property {string} ref - API reference URL for this job
 * @property {Object} language - Language information
 * @property {string} language.code - Language code (e.g., "en")
 * @property {string} language.label - Language label (e.g., "English")
 * @property {string} language.labelNative - Native language label (e.g., "English (US)")
 */

/**
 * @typedef JobDetails
 * @property {SmartRecruiters.JobAd} [jobAd] - Detailed job advertisement content
 * @property {string} [postingUrl] - Public job posting URL
 * @property {string} [applyUrl] - Direct application URL
 * @property {string} [referralUrl] - Employee referral URL
 */

/**
 * @typedef ListResponse
 * @property {number} offset - Response offset
 * @property {number} limit - Response limit
 * @property {number} totalFound - Total number of jobs found
 * @property {SmartRecruiters.ApiJob[]} content - Array of job postings
 */

/**
 * SmartRecruiters API Endpoints
 * @function SmartRecruiters.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoints:**
 * 1. `GET https://api.smartrecruiters.com/v1/companies/{hostname}/postings` (job list)
 * 2. `GET https://api.smartrecruiters.com/v1/companies/{hostname}/postings/{postingId}` (job details)
 * **Authentication:** API Key recommended (X-SmartToken header)
 * **Rate Limits:** Not specified
 * **Features:**
 * - ✅ Job descriptions via separate API call for each job
 * - ✅ Structured content (description, qualifications, additional info)
 * - ✅ City filtering support
 * - ⚠️ Requires additional API calls for descriptions (one per job)
 */

// =============================================================================
// PERSONIO PROVIDER
// =============================================================================

/**
 * @namespace Personio
 * Personio job board API integration
 * @see {@link https://developer.personio.de/docs/retrieving-open-job-positions}
 */

/**
 * @typedef JobDescription
 * @property {string} name - Field name/title
 * @property {string} value - CDATA content with HTML description
 */

/**
 * @typedef XmlJob
 * @property {string} id - Personio job ID
 * @property {string} name - Job title
 * @property {string} [subcompany] - Sub-company name
 * @property {string} [office] - Office/location
 * @property {string} [department] - Department name
 * @property {string} [recruitingCategory] - Recruiting category
 * @property {string} employmentType - Employment type (full-time, part-time, trainee, etc.)
 * @property {string} [seniority] - Seniority level (student, junior, senior, etc.)
 * @property {string} [schedule] - Work schedule (full-time, part-time, etc.)
 * @property {string} [yearsOfExperience] - Required years of experience
 * @property {string} [occupation] - Occupation type
 * @property {string} occupationCategory - Job category
 * @property {string} createdAt - Creation timestamp (XML date format)
 * @property {Personio.JobDescription[]} jobDescriptions - Array of description sections
 * @property {string} [description] - Parsed/concatenated description content
 */

/**
 * Personio API Endpoint
 * @function Personio.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://{hostname}.jobs.personio.de/xml?language={language}`
 * **Authentication:** None required
 * **Rate Limits:** Not specified
 * **Features:**
 * - ✅ Job descriptions included in XML response (CDATA sections)
 * - ✅ Multi-language support (en, de, fr, es, nl, it, pt)
 * - ✅ No additional API calls needed
 * - ✅ Structured description sections
 * **Format:** XML with CDATA content
 */

// =============================================================================
// WORKABLE PROVIDER
// =============================================================================

/**
 * @namespace Workable
 * Workable job board API integration
 * @see {@link https://workable.readme.io/reference/jobs-1}
 */

/**
 * @typedef ApiJob
 * @property {string} title - Job title
 * @property {string} shortcode - Job shortcode identifier
 * @property {string} code - Job code (usually empty)
 * @property {string} employment_type - Employment type (Full-time, Part-time, etc.)
 * @property {boolean} telecommuting - Whether telecommuting is allowed
 * @property {string} department - Department name
 * @property {string} url - Direct URL to job posting
 * @property {string} shortlink - Short URL to job posting
 * @property {string} application_url - URL for job application
 * @property {string} published_on - Date of publication (YYYY-MM-DD format)
 * @property {string} created_at - Date of creation (YYYY-MM-DD format)
 * @property {string} country - Job country
 * @property {string} city - Job city
 * @property {string} state - Job state/region
 * @property {string} education - Education requirements (usually empty)
 */

/**
 * @typedef WidgetResponse
 * @property {string} name - Company name
 * @property {string|null} description - Company description
 * @property {Workable.ApiJob[]} jobs - Array of job postings
 */

/**
 * Workable API Endpoint
 * @function Workable.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://apply.workable.com/api/v1/widget/accounts/{hostname}`
 * **Authentication:** None required for widget endpoint
 * **Rate Limits:** Not specified
 * **Features:**
 * - ❌ Job descriptions NOT available in widget endpoint
 * - ⚠️ Enhanced endpoint requires OAuth authentication
 * - ✅ Basic job information (title, location, URL)
 * 
 * **Note:** For job descriptions, use authenticated endpoint:
 * `GET https://{subdomain}.workable.com/spi/v3/jobs?include_fields=description,full_description`
 */

// =============================================================================
// RECRUITEE PROVIDER
// =============================================================================

/**
 * @namespace Recruitee
 * Recruitee job board API integration
 * @see {@link https://docs.recruitee.com/reference/offers}
 */

/**
 * @typedef Translation
 * @property {Object} en - English translations
 * @property {string} en.description - Job description in HTML
 * @property {string} en.title - Job title
 * @property {string|null} en.highlight - Job highlight
 * @property {string|null} en.requirements - Job requirements
 * @property {string} en.sharing_image - Social sharing image URL
 * @property {string} en.sharing_title - Social sharing title
 * @property {string} en.sharing_description - Social sharing description
 * @property {string} en.locations_question - Location preference question
 */

/**
 * @typedef Location
 * @property {number} id - Location ID
 * @property {string} name - Location name
 * @property {string} state - State/region
 * @property {string} country - Country name
 * @property {string} postal_code - Postal code
 */

/**
 * @typedef ApiJob
 * @property {number} id - Recruitee job ID
 * @property {string} options_photo - Photo options setting
 * @property {Recruitee.Translation} translations - Job content in different languages
 * @property {string} careers_apply_url - URL for job application
 * @property {string|null} cover_image - Cover image URL
 * @property {boolean} remote - Whether job is remote
 * @property {string} postal_code - Job postal code
 * @property {boolean} on_site - Whether job is on-site
 * @property {number} max_hours - Maximum working hours
 * @property {string} locations_question - Location preference question
 * @property {string|null} close_at - Job closing date (ISO 8601 format or null)
 * @property {Recruitee.Location[]} locations - Array of job locations
 * @property {string} created_at - ISO 8601 timestamp of creation (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @property {string} city - Job city
 * @property {string} country - Job country
 * @property {string} status - Job status ("published", "draft", etc.)
 * @property {string} title - Job title (derived from translations.en.title)
 * @property {string} careers_url - URL to job posting (same as careers_apply_url)
 */

/**
 * @typedef ApiResponse
 * @property {Recruitee.ApiJob[]} offers - Array of job offers
 */

/**
 * Recruitee API Endpoint
 * @function Recruitee.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://{hostname}.recruitee.com/api/offers`
 * **Authentication:** None required for public endpoint
 * **Rate Limits:** Not specified
 * **Features:**
 * - ❌ Job descriptions NOT available in public endpoint
 * - ✅ Status filtering (only published jobs)
 * - ✅ Basic job information
 * 
 * **Note:** For job descriptions, authenticated API access may be required
 */

// =============================================================================
// RIPPLING PROVIDER
// =============================================================================

/**
 * @namespace Rippling
 * Rippling job board API integration
 * @see {@link https://developer.rippling.com/documentation/job-board-api-v2/reference/get-board-slug-jobs}
 */

/**
 * @typedef JobLocation
 * @property {string} [city] - City name
 * @property {string} [country] - Country name
 * @property {string} [name] - Location name (fallback)
 */

/**
 * @typedef ApiJob
 * @property {string} id - Rippling job ID
 * @property {string} name - Job title
 * @property {string} url - Direct URL to job posting
 * @property {Rippling.JobLocation[]} locations - Array of job locations
 */

/**
 * @typedef ApiResponse
 * @property {Rippling.ApiJob[]} items - Array of job postings
 * @property {number} totalPages - Total number of pages
 * @property {number} page - Current page number
 */

/**
 * Rippling API Endpoint
 * @function Rippling.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** `GET https://api.rippling.com/platform/api/ats/v2/board/{hostname}/jobs?page={page}`
 * **Authentication:** OAuth 2.0 JWT Bearer token required
 * **Rate Limits:** 100 requests per second per project
 * **Features:**
 * - ❓ Job descriptions availability unknown (documentation inaccessible)
 * - ✅ Pagination support
 * - ✅ Multiple locations per job
 * - ⚠️ No published date (uses current timestamp)
 */

// =============================================================================
// MATRIX PROVIDER
// =============================================================================

/**
 * @namespace Matrix
 * Matrix protocol job board integration
 * @see {@link https://spec.matrix.org/latest/}
 */

/**
 * @typedef JobContent
 * @property {string} title - Job title
 * @property {string} url - Job application URL
 * @property {string} description - Job description
 * @property {string} location - Job location
 */

/**
 * @typedef RoomEvent
 * @property {string} event_id - Matrix event ID
 * @property {Matrix.JobContent} content - Event content
 * @property {number} origin_server_ts - Unix timestamp (milliseconds since epoch)
 */

/**
 * @typedef MessagesResponse
 * @property {Matrix.RoomEvent[]} chunk - Array of room events
 * @property {string} [error] - Error message if request failed
 */

/**
 * Matrix API Endpoint
 * @function Matrix.getJobs
 * @param {GetJobsParams} params - Parameters for fetching jobs (hostname = roomId)
 * @returns {Promise<BaseJobData[]>} Array of standardized job objects
 * 
 *
 * **Endpoint:** Matrix homeserver API (room messages)
 * **Authentication:** Matrix access token required
 * **Rate Limits:** Per homeserver configuration
 * **Features:**
 * - ✅ Job descriptions included in message content
 * - ✅ Custom Matrix job event format
 * - ✅ Decentralized job posting system
 * 
 * **Special Notes:**
 * - Uses Matrix room ID as hostname parameter
 * - Jobs are Matrix room events with specific content format
 * - Leverages Matrix Web Client (MWC) library
 */

// =============================================================================
// COMMON TYPES AND INTERFACES
// =============================================================================

/**
 * @typedef ProviderApiCapabilities
 * @property {boolean} hasDescriptions - Whether provider supports job descriptions
 * @property {boolean} requiresAuth - Whether authentication is required
 * @property {boolean} requiresMultipleRequests - Whether multiple API calls needed for full data
 * @property {boolean} supportsPagination - Whether API supports pagination
 * @property {boolean} supportsFiltering - Whether API supports location/other filtering
 * @property {string[]} supportedLanguages - List of supported language codes
 * @property {string} descriptionFormat - Format of description content (html|text|markdown)
 */

/**
 * Provider Capabilities Matrix
 * @type {Object.<string, ProviderApiCapabilities>}
 */
export const PROVIDER_CAPABILITIES = {
  greenhouse: {
    hasDescriptions: true,
    requiresAuth: false, 
    requiresMultipleRequests: false,
    supportsPagination: false,
    supportsFiltering: true,
    supportedLanguages: ['en'],
    descriptionFormat: 'html'
  },
  ashby: {
    hasDescriptions: true,
    requiresAuth: false,
    requiresMultipleRequests: true,
    supportsPagination: false, 
    supportsFiltering: false,
    supportedLanguages: ['en'],
    descriptionFormat: 'html'
  },
  lever: {
    hasDescriptions: true,
    requiresAuth: false,
    requiresMultipleRequests: false,
    supportsPagination: false,
    supportsFiltering: false,
    supportedLanguages: ['en'],
    descriptionFormat: 'html'
  },
  smartrecruiters: {
    hasDescriptions: true,
    requiresAuth: false,
    requiresMultipleRequests: true,
    supportsPagination: false,
    supportsFiltering: true,
    supportedLanguages: ['en'],
    descriptionFormat: 'html'
  },
  personio: {
    hasDescriptions: true,
    requiresAuth: false,
    requiresMultipleRequests: false,
    supportsPagination: false,
    supportsFiltering: false,
    supportedLanguages: ['en', 'de', 'fr', 'es', 'nl', 'it', 'pt'],
    descriptionFormat: 'html'
  },
  workable: {
    hasDescriptions: false,
    requiresAuth: false,
    requiresMultipleRequests: false,
    supportsPagination: false,
    supportsFiltering: false,
    supportedLanguages: ['en'],
    descriptionFormat: 'html'
  },
  recruitee: {
    hasDescriptions: false,
    requiresAuth: false,
    requiresMultipleRequests: false,
    supportsPagination: false,
    supportsFiltering: false,
    supportedLanguages: ['en'],
    descriptionFormat: 'text'
  },
  rippling: {
    hasDescriptions: false, // Unknown due to inaccessible docs
    requiresAuth: true,
    requiresMultipleRequests: false,
    supportsPagination: true,
    supportsFiltering: false,
    supportedLanguages: ['en'],
    descriptionFormat: 'unknown'
  },
  matrix: {
    hasDescriptions: true,
    requiresAuth: true,
    requiresMultipleRequests: false,
    supportsPagination: true,
    supportsFiltering: true,
    supportedLanguages: ['en'],
    descriptionFormat: 'text'
  }
};

/**
 * @typedef ApiError
 * @property {string} error - Error message
 * @property {string} errcode - Error code identifier
 * @property {number} [status] - HTTP status code
 * @property {string} [provider] - Provider that generated the error
 */

/**
 * Standard error codes used across providers
 * @enum {string}
 */
export const ERROR_CODES = {
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR', 
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  MISSING_HOSTNAME: 'MISSING_HOSTNAME'
};