import { parse as parsefm } from "hexo-front-matter";

const parseFrontmatter = (mdString) => {
	const data = parsefm(mdString);
	delete data["_content"];
	return data;
};

export { parseFrontmatter };
