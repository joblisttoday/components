/* a job, used in joblist.today systems */
class Job {
	constructor(data) {
		const attributes = [
			/* job data */
			"id",
			"name",
			"url",
			"publishedDate",
			"location",

			/* company data */
			"companyTitle",
			"companySlug",
			"providerId",
			"providerHostname",
		];

		/* if not company title, use providerHostname */
		data.companyTitle = data.companyTitle || data.providerHostname;
		data.location = data.location || "Not specified";

		const missingAttr = this.getMissingAttributes(attributes, data);
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
		this.companySlug = data.companySlug;
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

export { Job, Provider };
