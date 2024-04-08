class Company {
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
		];
	}
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

/* a job, used in joblist.today systems */
class Job {
	get attributes() {
		return [
			/* job data */
			"id",
			"name",
			"url",
			"publishedDate",
			"location",

			/* company data */
			"companyTitle",
			"companyId",
			"providerId",
			"providerHostname",
		];
	}
	constructor(data) {
		/* if not company title, use providerHostname */
		data.companyTitle = data.companyTitle || data.providerHostname;
		data.location = data.location || "Not specified";

		const missingAttr = this.getMissingAttributes(this.attributes, data);
		if (missingAttr && missingAttr.length) {
			console.log("Error creating job", missingAttr, data);
		} else {
			this.createJob(data);
		}
	}

	getMissingAttributes(attributes, jobData) {
		return attributes.filter((attr) => !jobData[attr]);
	}

	createJob(data) {
		const objectID = `${data.providerId}-${data.providerHostname}-${data.id}`;
		this.objectID = objectID;
		this.name = data.name;
		this.url = data.url;
		this.publishedDate = data.publishedDate;
		this.location = data.location;
		this.companyTitle = data.companyTitle;
		this.companyId = data.companyId;
	}
}

/* a job-board provider API */
class Provider {
	constructor({ id, getJobs }) {
		if (!id) {
			return console.log("Provider.id missing");
		}
		if (!getJobs || typeof getJobs !== "function") {
			return console.log("Provider.getJobs needs to be an async function");
		}

		this.id = id;
		this.getJobs = getJobs;
	}
	/* should return an array of all Job(s)
		 for a `hostname` of a company's job-board hosted by this provider */
	async getJobs() {}
}

export { Company, Job, Provider };
