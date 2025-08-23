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
 * @property {string|Date} publishedDate - When the job was published
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
 * @typedef ApiJob
 * @property {number} id - Greenhouse job ID
 * @property {string} title - Job title
 * @property {string} content - Job description (HTML format) - only when ?content=true
 * @property {string} absolute_url - Full URL to job posting
 * @property {string} updated_at - ISO timestamp of last update
 * @property {Greenhouse.JobLocation} location - Primary job location
 * @property {Greenhouse.JobOffice[]} offices - List of office locations
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
 * @property {string} id - Ashby job ID
 * @property {string} title - Job title
 * @property {string} locationName - Primary location name
 * @property {string} employmentType - Employment type (Full-time, Part-time, etc.)
 * @property {Ashby.JobSecondaryLocation[]} secondaryLocations - Additional locations
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
 */

/**
 * @typedef ApiJob
 * @property {string} id - Lever job ID
 * @property {string} text - Job title
 * @property {string} description - Job description (HTML format)
 * @property {string} descriptionPlain - Job description (plain text)
 * @property {string} additional - Additional content (HTML)
 * @property {string} additionalPlain - Additional content (plain text)
 * @property {number} createdAt - Unix timestamp of creation
 * @property {string} country - Job country
 * @property {string} hostedUrl - URL to job posting
 * @property {Lever.JobCategories} categories - Job categorization
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
 * @property {string} country - Country name
 */

/**
 * @typedef JobAd
 * @property {Object} sections - Job ad content sections
 * @property {Object} sections.jobDescription - Main job description
 * @property {string} sections.jobDescription.text - Job description HTML content
 * @property {Object} sections.qualifications - Job requirements
 * @property {string} sections.qualifications.text - Requirements HTML content
 * @property {Object} sections.additionalInformation - Additional details
 * @property {string} sections.additionalInformation.text - Additional info HTML content
 */

/**
 * @typedef ApiJob
 * @property {string} uuid - SmartRecruiters job UUID
 * @property {string} id - SmartRecruiters job ID (different from UUID)
 * @property {string} name - Job title
 * @property {string} releasedDate - ISO timestamp of publication
 * @property {SmartRecruiters.JobLocation} location - Job location
 */

/**
 * @typedef JobDetails
 * @property {SmartRecruiters.JobAd} jobAd - Detailed job advertisement content
 */

/**
 * @typedef ListResponse
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
 * @property {string} n - Field name/title
 * @property {string} value - CDATA content with HTML description
 */

/**
 * @typedef XmlJob
 * @property {string} id - Personio job ID
 * @property {string} name - Job title  
 * @property {string} office - Office/location
 * @property {string} createdAt - Creation timestamp
 * @property {string} occupationCategory - Job category
 * @property {string} employmentType - Employment type
 * @property {Personio.JobDescription[]} jobDescriptions - Array of description sections
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
 * @property {string} id - Workable job ID
 * @property {string} title - Job title
 * @property {string} city - Job city
 * @property {string} country - Job country
 * @property {string} url - Direct URL to job posting
 * @property {string} published_on - ISO timestamp of publication
 */

/**
 * @typedef WidgetResponse
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
 * @typedef ApiJob
 * @property {number} id - Recruitee job ID
 * @property {string} title - Job title
 * @property {string} careers_url - URL to job posting
 * @property {string} created_at - ISO timestamp of creation
 * @property {string} city - Job city
 * @property {string} country - Job country
 * @property {string} status - Job status ("published", "draft", etc.)
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
 * @property {number} origin_server_ts - Unix timestamp
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