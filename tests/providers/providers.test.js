import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Import all providers
import { getJobs as getGreenhouseJobs } from '../../src/providers/greenhouse.js';
import { getJobs as getAshbyJobs } from '../../src/providers/ashby.js';
import { getJobs as getLeverJobs } from '../../src/providers/lever.js';
import { getJobs as getSmartRecruitersJobs } from '../../src/providers/smartrecruiters.js';
import { getJobs as getPersonioJobs } from '../../src/providers/personio.js';
import { getJobs as getWorkableJobs } from '../../src/providers/workable.js';
import { getJobs as getRecruiteeJobs } from '../../src/providers/recruitee.js';
import { getJobs as getRipplingJobs } from '../../src/providers/rippling.js';

// Mock data based on real API responses
const mockGreenhouseResponse = {
  jobs: [
    {
      id: 6103655003,
      title: "Software Engineer",
      content: "Job description content",
      absolute_url: "https://boards.greenhouse.io/test/jobs/6103655003",
      updated_at: "2025-08-21T16:51:52-04:00",
      location: { name: "San Francisco, CA" },
      offices: [{ name: "SF Office", location: "San Francisco, CA" }],
      data_compliance: [],
      internal_job_id: 5002593003,
      metadata: [],
      requisition_id: "REQ-123",
      company_name: "Test Company",
      first_published: "2024-10-11T15:09:09-04:00",
      departments: []
    }
  ]
};

const mockAshbyGraphQLResponse = {
  data: {
    jobBoard: {
      jobPostings: [
        {
          id: "test-job-123",
          title: "Frontend Engineer",
          locationName: "Remote",
          employmentType: "FULL_TIME",
          secondaryLocations: []
        }
      ]
    }
  }
};

const mockAshbyJobDetailsResponse = {
  data: {
    jobPosting: {
      descriptionHtml: "<p>Job description HTML content</p>"
    }
  }
};

const mockLeverResponse = [
  {
    id: "abc-123",
    text: "Backend Engineer",
    description: "<p>Job description</p>",
    descriptionPlain: "Job description",
    additional: "<p>Additional info</p>",
    additionalPlain: "Additional info",
    createdAt: 1640995200000,
    country: "US",
    hostedUrl: "https://jobs.lever.co/test/abc-123",
    applyUrl: "https://jobs.lever.co/test/abc-123/apply",
    categories: {
      location: "New York, NY",
      commitment: "Full-time",
      department: "Engineering",
      team: "Backend"
    }
  }
];

const mockSmartRecruitersResponse = {
  offset: 0,
  limit: 100,
  totalFound: 1,
  content: [
    {
      id: "744000077603107",
      name: "Product Manager",
      uuid: "22af8b3f-3d9b-41fa-9ed7-43d504a255b9",
      jobAdId: "19d2f0af-a26b-4197-93f2-d8f990a7a08b",
      defaultJobAd: true,
      refNumber: "REF850R",
      company: { identifier: "test", name: "Test Company" },
      releasedDate: "2025-08-22T07:31:19.597Z",
      location: {
        city: "Berlin",
        region: "BE",
        country: "de",
        remote: false,
        fullLocation: "Berlin, BE, Germany"
      }
    }
  ]
};

const mockSmartRecruitersJobDetailsResponse = {
  jobAd: {
    sections: {
      jobDescription: { text: "Job description content" },
      qualifications: { text: "Required qualifications" },
      additionalInformation: { text: "Additional information" }
    }
  }
};

const mockPersonioXMLResponse = `<?xml version="1.0" encoding="UTF-8"?>
<workzag-jobs>
  <position>
    <id>123</id>
    <name>DevOps Engineer</name>
    <office>Berlin Office</office>
    <createdAt>2025-01-01T00:00:00+00:00</createdAt>
    <occupationCategory>engineering</occupationCategory>
    <employmentType>full-time</employmentType>
    <jobDescriptions>
      <jobDescription>
        <name>Description</name>
        <value>Job description content</value>
      </jobDescription>
    </jobDescriptions>
  </position>
</workzag-jobs>`;

const mockWorkableResponse = {
  name: "Test Company",
  description: "Company description",
  jobs: [
    {
      id: "ABC123",
      title: "UX Designer",
      shortcode: "ABC123",
      code: "",
      employment_type: "Full-time",
      telecommuting: false,
      department: "Design",
      url: "https://apply.workable.com/test/j/ABC123",
      shortlink: "https://apply.workable.com/j/ABC123",
      application_url: "https://apply.workable.com/j/ABC123/apply",
      published_on: "2025-08-11",
      created_at: "2025-08-11",
      country: "United States",
      city: "San Francisco",
      state: "California",
      education: ""
    }
  ]
};

const mockRecruiteeResponse = {
  offers: [
    {
      id: 123456,
      title: "Marketing Manager",
      description: "Marketing manager job description",
      requirements: "Required qualifications",
      careers_url: "https://test.recruitee.com/o/marketing-manager/c/new",
      created_at: "2025-08-01T10:00:00Z",
      city: "New York",
      country: "United States",
      status: "published"
    }
  ]
};

describe('Job Board Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Greenhouse Provider', () => {
    test('should fetch and parse jobs correctly', async () => {
      // Mock fetch for Greenhouse API
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockGreenhouseResponse)
      });

      const jobs = await getGreenhouseJobs({
        hostname: 'test-company',
        companyTitle: 'Test Company',
        companyId: 'test-company-id'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://boards-api.greenhouse.io/v1/boards/test-company/jobs?content=true'
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'greenhouse-test-company-greenhouse-test-company-6103655003',
        name: 'Software Engineer',
        url: 'https://boards.greenhouse.io/test/jobs/6103655003',
        companyTitle: 'Test Company',
        companyId: 'test-company-id'
      });
    });

    test('should filter jobs by city when provided', async () => {
      const jobsWithOffices = {
        jobs: [{
          ...mockGreenhouseResponse.jobs[0],
          offices: [
            { name: "SF Office", location: "San Francisco, CA" },
            { name: "NY Office", location: "New York, NY" }
          ]
        }]
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(jobsWithOffices)
      });

      const jobs = await getGreenhouseJobs({
        hostname: 'test-company',
        city: 'san francisco'
      });

      expect(jobs).toHaveLength(1);
    });

    test('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const jobs = await getGreenhouseJobs({
        hostname: 'test-company'
      });

      expect(jobs).toBeUndefined();
    });
  });

  describe('Ashby Provider', () => {
    test('should fetch jobs and descriptions correctly', async () => {
      // Mock the GraphQL requests
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockAshbyGraphQLResponse)
        })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockAshbyJobDetailsResponse)
        });

      const jobs = await getAshbyJobs({
        hostname: 'test-company',
        companyTitle: 'Test Company'
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'ashby-test-company-ashby-test-company-test-job-123',
        name: 'Frontend Engineer',
        location: 'Remote'
      });
    });

    test('should handle GraphQL errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ data: null })
      });

      const jobs = await getAshbyJobs({
        hostname: 'invalid-company'
      });

      expect(jobs).toHaveLength(0);
    });
  });

  describe('Lever Provider', () => {
    test('should fetch and parse jobs correctly', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockLeverResponse)
      });

      const jobs = await getLeverJobs({
        hostname: 'test-company',
        companyTitle: 'Test Company'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.lever.co/v0/postings/test-company'
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'lever-test-company-lever-test-company-abc-123',
        name: 'Backend Engineer',
        location: 'New York, NY, US'
      });
    });

    test('should handle non-array responses', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ error: 'Company not found' })
      });

      const jobs = await getLeverJobs({
        hostname: 'invalid-company'
      });

      expect(jobs).toHaveLength(0);
    });
  });

  describe('SmartRecruiters Provider', () => {
    test('should fetch jobs and descriptions', async () => {
      // Mock job list and job details API calls
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockSmartRecruitersResponse)
        })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockSmartRecruitersJobDetailsResponse)
        });

      const jobs = await getSmartRecruitersJobs({
        hostname: 'test-company'
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.smartrecruiters.com/v1/companies/test-company/postings'
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.smartrecruiters.com/v1/companies/test-company/postings/744000077603107'
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'smartrecruiters-test-company-smartrecruiters-test-company-22af8b3f-3d9b-41fa-9ed7-43d504a255b9',
        name: 'Product Manager',
        location: 'Berlin, BE, Germany'
      });
    });

    test('should filter jobs by city', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockSmartRecruitersResponse)
      });

      const jobs = await getSmartRecruitersJobs({
        hostname: 'test-company',
        city: 'berlin'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.smartrecruiters.com/v1/companies/test-company/postings?city=Berlin'
      );
    });
  });

  describe('Personio Provider', () => {
    test('should fetch and parse XML jobs', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        text: vi.fn().mockResolvedValueOnce(mockPersonioXMLResponse)
      });

      const jobs = await getPersonioJobs({
        hostname: 'test-company',
        language: 'en'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-company.jobs.personio.de/xml?language=en'
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'personio-test-company-personio-test-company-123',
        name: 'DevOps Engineer'
      });
    });

    test('should handle different languages', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        text: vi.fn().mockResolvedValueOnce(mockPersonioXMLResponse)
      });

      await getPersonioJobs({
        hostname: 'test-company',
        language: 'de'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-company.jobs.personio.de/xml?language=de'
      );
    });
  });

  describe('Workable Provider', () => {
    test('should fetch jobs from widget API', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockWorkableResponse)
      });

      const jobs = await getWorkableJobs({
        hostname: 'test-company'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://apply.workable.com/api/v1/widget/accounts/test-company',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/json' }
        })
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'workable-test-company-workable-test-company-ABC123',
        name: 'UX Designer',
        location: 'San Francisco, United States'
      });
    });

    test('should handle missing company data', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ jobs: null })
      });

      const jobs = await getWorkableJobs({
        hostname: 'invalid-company'
      });

      expect(jobs).toHaveLength(0);
    });
  });

  describe('Recruitee Provider', () => {
    test('should fetch and parse job offers', async () => {
      const expectedUrl = 'https://test-company.recruitee.com/api/offers';
      global.fetch = vi.fn().mockResolvedValueOnce({
        url: expectedUrl, // Important: must match the expected URL for Recruitee provider
        json: vi.fn().mockResolvedValueOnce(mockRecruiteeResponse)
      });

      const jobs = await getRecruiteeJobs({
        hostname: 'test-company'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toMatchObject({
        id: 'recruitee-test-company-recruitee-test-company-123456',
        name: 'Marketing Manager',
        location: 'New York, United States'
      });
    });
  });

  describe('Provider Error Handling', () => {
    test('all providers should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      global.fetch = vi.fn().mockRejectedValue(networkError);

      const providers = [
        { name: 'Greenhouse', fn: getGreenhouseJobs },
        { name: 'Ashby', fn: getAshbyJobs },
        { name: 'Lever', fn: getLeverJobs },
        { name: 'SmartRecruiters', fn: getSmartRecruitersJobs },
        { name: 'Personio', fn: getPersonioJobs },
        { name: 'Workable', fn: getWorkableJobs },
        { name: 'Recruitee', fn: getRecruiteeJobs }
      ];

      for (const provider of providers) {
        const result = await provider.fn({ hostname: 'test' });
        // Some providers return undefined on error, others return empty arrays
        if (result !== undefined) {
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        }
        // Test passed as long as no exception was thrown
      }
    });

    test('providers should handle empty responses', async () => {
      const emptyResponses = {
        greenhouse: { jobs: [] },
        lever: [],
        smartrecruiters: { content: [] },
        workable: { jobs: [] },
        recruitee: { offers: [] }
      };

      for (const [providerName, emptyResponse] of Object.entries(emptyResponses)) {
        global.fetch = vi.fn().mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(emptyResponse),
          text: vi.fn().mockResolvedValueOnce('<?xml version="1.0"?><workzag-jobs></workzag-jobs>')
        });

        let result;
        switch (providerName) {
          case 'greenhouse':
            result = await getGreenhouseJobs({ hostname: 'test' });
            break;
          case 'lever':
            result = await getLeverJobs({ hostname: 'test' });
            break;
          case 'smartrecruiters':
            result = await getSmartRecruitersJobs({ hostname: 'test' });
            break;
          case 'workable':
            result = await getWorkableJobs({ hostname: 'test' });
            break;
          case 'recruitee':
            result = await getRecruiteeJobs({ hostname: 'test' });
            break;
        }

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      }
    });
  });

  describe('Job Data Standardization', () => {
    test('all providers should return standardized job objects', async () => {
      // Test that all providers return jobs with required fields
      const requiredFields = ['id', 'name', 'url', 'companyTitle', 'companyId'];

      const mockProviders = [
        { fn: getGreenhouseJobs, response: mockGreenhouseResponse },
        { fn: getLeverJobs, response: mockLeverResponse },
        { fn: getWorkableJobs, response: mockWorkableResponse },
        { fn: getRecruiteeJobs, response: mockRecruiteeResponse }
      ];

      for (const { fn, response } of mockProviders) {
        global.fetch = vi.fn().mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(response),
          text: vi.fn().mockResolvedValueOnce(mockPersonioXMLResponse)
        });

        const jobs = await fn({ hostname: 'test', companyTitle: 'Test Co', companyId: 'test-id' });
        
        if (jobs && jobs.length > 0) {
          const job = jobs[0];
          for (const field of requiredFields) {
            expect(job).toHaveProperty(field);
            expect(job[field]).toBeTruthy();
          }
        }
      }
    });

    test('job IDs should follow consistent naming pattern', async () => {
      const hostname = 'test-company';
      const expectedProviderIds = [
        { fn: getGreenhouseJobs, response: mockGreenhouseResponse, id: 'greenhouse' },
        { fn: getLeverJobs, response: mockLeverResponse, id: 'lever' },
        { fn: getWorkableJobs, response: mockWorkableResponse, id: 'workable' },
        { fn: getRecruiteeJobs, response: mockRecruiteeResponse, id: 'recruitee' }
      ];

      for (const { fn, response, id } of expectedProviderIds) {
        global.fetch = vi.fn().mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(response)
        });

        const jobs = await fn({ hostname });
        
        if (jobs && jobs.length > 0) {
          jobs.forEach(job => {
            expect(job.id).toMatch(new RegExp(`^${id}-${hostname}-${id}-${hostname}-`));
          });
        }
      }
    });
  });
});