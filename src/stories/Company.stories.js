import { html } from "lit-html";
import "../components/company.js";

export default {
	title: "Components/Company",
	component: "joblist-company",
	parameters: {
		docs: {
			description: {
				component:
					"Display detailed company information including description, links, jobs, and interactive features like favorites and notes.",
			},
		},
	},
	argTypes: {
		"company-id": {
			control: "text",
			description: "Unique identifier for the company",
			defaultValue: "stripe",
		},
		full: {
			control: "boolean",
			description:
				"Show full company details including job board and interactive features",
			defaultValue: false,
		},
		origin: {
			control: "text",
			description: "Base URL for company profiles",
			defaultValue: "https://joblist.today",
		},
	},
};

const Template = (args) => html`
	<joblist-company
		company-id="${args["company-id"]}"
		?full="${args.full}"
		origin="${args.origin}"
	></joblist-company>
`;

export const Basic = Template.bind({});
Basic.args = {
	"company-id": "ableton",
	full: false,
};

export const FullView = Template.bind({});
FullView.args = {
	"company-id": "ableton",
	full: true,
};

export const WithCustomData = Template.bind({});
WithCustomData.args = {
	"company-id": "example",
	full: true,
};

export const Loading = Template.bind({});
Loading.args = {
	"company-id": "loading-company",
	full: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
	"company-id": "non-existent-company",
	full: true,
};
