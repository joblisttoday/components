/**
 * @fileoverview Core data models for joblist.today system
 */

/**
 * @typedef {Object} CompanyData
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Last update timestamp
 * @property {string} [id] - Company unique identifier
 * @property {string} [title] - Company name
 * @property {string} [description] - Company description
 * @property {string[]|string} [tags] - Company tags (JSON string or array)
 * @property {Object[]|string} [positions] - Job positions (JSON string or array)
 * @property {string} [job_board_provider] - Job board provider (greenhouse, lever, etc.)
 * @property {string} [job_board_hostname] - Provider-specific hostname
 * @property {string} [company_url] - Company website URL
 * @property {string} [job_board_url] - Job board URL
 * @property {string} [twitter_url] - Twitter profile URL
 * @property {string} [linkedin_url] - LinkedIn profile URL
 * @property {string} [youtube_url] - YouTube channel URL
 * @property {string} [instagram_url] - Instagram profile URL
 * @property {string} [facebook_url] - Facebook page URL
 * @property {string} [github_url] - GitHub organization URL
 * @property {string} [wikipedia_url] - Wikipedia page URL
 * @property {boolean} [is_highlighted] - Whether company is highlighted
 * @property {number} [total_jobs] - Total number of jobs (computed)
 */

/**
 * @typedef {Object} CompanyOptions
 * @property {boolean} [serializePositions=true] - Whether to parse positions JSON
 * @property {boolean} [serializeTags=true] - Whether to parse tags JSON
 */

/**
 * Company model representing a company in the joblist.today system
 */
class Company {
	/**
	 * Get list of all company attributes
	 * @returns {string[]} Array of attribute names
	 */
	get attributes() {
		return [
			// could delete the dates and get info from git-repo/github
			"created_at",
			"updated_at",
			"id",
			"title",
			"description",
			"tags",
			"positions",
			// for jobs
			"job_board_provider",
			"job_board_hostname",
			// urls
			"company_url",
			"job_board_url",
			"twitter_url",
			"linkedin_url",
			"youtube_url",
			"instagram_url",
			"facebook_url",
			"github_url",
			"wikipedia_url",
			// from stripe.db merge
			"is_highlighted",
			// joined from jobs table
			"total_jobs",
		];
	}
	/**
	 * Create a new Company instance
	 * @param {CompanyData} data - Company data object
	 * @param {CompanyOptions} [options] - Configuration options
	 */
	constructor(data, { serializePositions = true, serializeTags = true } = {}) {
		this.create(data);
		if (
			serializePositions &&
			this.positions &&
			typeof this.positions === "string"
		) {
			try {
				this.positions = JSON.parse(this.positions);
			} catch (e) {}
		}
		if (serializeTags && this.tags && typeof this.tags === "string") {
			try {
				this.tags = JSON.parse(this.tags);
			} catch (e) {}
		}
	}
	/**
	 * Initialize company properties from data
	 * @param {CompanyData} data - Company data object
	 */
	create(data) {
		this.attributes.forEach((attr) => {
			const attrVal = data[attr];
			if (attrVal) {
				if ("is_highlighted" === attr) {
					try {
						this[attr] = Boolean(attrVal);
					} catch (e) {}
				} else {
					this[attr] = attrVal;
				}
			}
			if (!this[attr] || !attrVal) {
				this[attr] = undefined;
			}
		});
	}
}

/**
 * @typedef {Object} JobData
 * @property {string} id - Original job ID from provider
 * @property {string} name - Job title
 * @property {string} [description] - Job description (HTML or plain text)
 * @property {string} url - URL to job posting
 * @property {string} [employmentType] - The type of employment
 * @property {string} [department] - the department
 * @property {string|Date} [publishedDate] - Job publication date
 * @property {string} [location] - Job location
 * @property {string} companyTitle - Company name
 * @property {string} companyId - Company identifier
 * @property {string} providerId - Job board provider identifier
 * @property {string} providerHostname - Provider-specific hostname
 */

/**
 * Job model representing a job posting in the joblist.today system
 */
class Job {
	/**
	 * Get list of all job attributes
	 * @returns {string[]} Array of attribute names
	 */
	get attributes() {
		return [
			/* job data */
			"id",
			"name",
			"description",
			"url",
			"publishedDate",
			"location",
			"employmentType",
			"department",

			/* company data */
			"companyTitle",
			"companyId",
			"providerId",
			"providerHostname",
		];
	}
	/**
	 * Create a new Job instance
	 * @param {JobData} data - Job data object
	 */
	constructor(data) {
		this.createJob(data);
	}

	/**
	 * Get missing required attributes from job data
	 * @param {string[]} attributes - List of all attributes
	 * @param {JobData} jobData - Job data to validate
	 * @returns {string[]} Array of missing required attributes
	 */
	getMissingAttributes(attributes, jobData) {
		// Not used anymore; kept for compatibility
		return [];
	}

	/**
	 * Initialize job properties from validated data
	 * @param {JobData} data - Job data object
	 */
	createJob(data) {
		if (data.providerId && data.providerHostname) {
			this.id = `${data.providerId}-${data.providerHostname}-${data.id}`;
		} else {
			this.id = data.id;
		}
		this.name = data.name;
		this.description = data.description;
		this.url = data.url;
		this.publishedDate = data.publishedDate;
		this.location = data.location;
		this.employmentType = data.employmentType;
		this.department = data.department;
		this.companyTitle = data.companyTitle || data.providerHostname;
		this.companyId = data.companyId;
		this.providerId = data.providerId;
		this.providerHostname = data.providerHostname;
	}
}

/**
 * @typedef {Object} GetJobsParams
 * @property {string} hostname - Company hostname for the provider
 * @property {string} [companyTitle] - Optional company title
 * @property {string} [companyId] - Optional company ID
 * @property {string} [city] - Optional city filter
 * @property {string} [country] - Optional country filter
 * @property {string} [language] - Optional language parameter
 */

/**
 * @callback GetJobsFunction
 * @param {GetJobsParams} params - Parameters for fetching jobs
 * @returns {Promise<Job[]>} Promise that resolves to array of Job instances
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {string} id - Unique provider identifier
 * @property {GetJobsFunction} getJobs - Function to fetch jobs from provider
 */

/**
 * Job board provider API wrapper
 */
class Provider {
	/**
	 * Create a new Provider instance
	 * @param {ProviderConfig} config - Provider configuration
	 */
	constructor(config = {}) {
		// Assign all provided config as properties
		Object.assign(this, config);
	}
	/**
	 * Fetch jobs from the provider for a given company hostname
	 * @param {GetJobsParams} params - Parameters for fetching jobs
	 * @returns {Promise<Job[]>} Array of Job instances
	 */
	async getJobs() {}
}

export { Company, Job, Provider };
