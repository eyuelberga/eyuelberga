const yaml = require("js-yaml");
const yargs = require("yargs");
const fs = require("fs");

const generateBadge = (link, logo, logoColor, backgroundColor) => {
  return `<a href="${link}"><img src="https://img.shields.io/badge/${logo}-${backgroundColor}?style=for-the-badge&logo=${logo}&logoColor=${logoColor}" alt="${logo}" /></a>&nbsp;`;
};

const getBannerFromRepo = (repo, path, username, branch) => {
  return `https://github.com/${username}/${repo}/blob/${branch}/${path}?raw=true`;
};
const addProject = (name, username, repo, color, banner) => {
  return `<span align="center">
      <a href="https://github.com/${username}/${repo}/" >
      <img src="${banner}" width="400" alt="${name}" />
      </a>
      </span>`;
};

const getSocialLink = (socialMedia, handle) => {
  switch (socialMedia) {
    case "linkedin":
      return `https://linkedin.com/ln/${handle}`;
    case "dev.to":
      return `https://dev.to/${handle}`;
    case "medium":
      return `https://${handle}.medium.com`;
    case "github":
      return `https://github.com/${handle}`;
    case "twitter":
      return `https://twitter.com/${handle}`;
    default:
      return handle;
  }
};

const addRecentArticles = (social) => {
  const getMediumArticle = (username, index) => {
    return `<a target="_blank" href="https://github-readme-medium-recent-article.vercel.app/medium/@${username}/${index}"><img src="https://github-readme-medium-recent-article.vercel.app/medium/@${username}/${index}" alt="Recent Article ${index}">`;
  };
  const out = [];
  [0, 1, 2].forEach((i) => {
    out.push(getMediumArticle(social.medium, i));
  });
  return out.join("\n");
};
const addGithubStats = (githubHandle) => {
  return `<a href="https://github.com/${githubHandle}" align="center">
      <img src="https://github-readme-stats.vercel.app/api?username=${githubHandle}&show_icons=true&line_height=27&count_private=true&title_color=000000&text_color=000000&icon_color=3e7e7e&hide_border=true" alt="${githubHandle}'s GitHub Stats" />
    </a>`;
};
const generateReadme = (
  data,
  primaryColor = "3e7e7e",
  secondaryColor = "fed850"
) => {
  const content = [];
  // add top banner
  content.push(
    `[![${data.name}](/assets/banner.png)](https://github.com/${data.social.github})`
  );
  // add badges with social media links
  const so = [];
  Object.keys(data.social).forEach((social) => {
    const link = getSocialLink(social, data.social[social]);
    so.push({ logo: social, link });
  });
  const socials = so
    .map(({ link, logo }) => {
      return generateBadge(link, logo, secondaryColor, primaryColor);
    })
    .join("\n");
  content.push(`<p align="center">\n ${socials} \n</p>`);
  // add summary
  content.push(`<p align="center">${data.summary} </p>`);

  // add projects
  if (data.projects) {
    content.push("## :computer: Featured Projects");
    data.projects.forEach(({ name, repo, banner: { branch, path } }) => {
      const username = data.social.github;
      const banner = getBannerFromRepo(repo, path, username, branch);
      content.push(addProject(name, username, repo, primaryColor, banner));
    });
  }
  // check if medium account exists
  if (data.social.medium) {
    content.push("## :newspaper: Recent Articles");
    content.push(addRecentArticles(data.social));
  }
  return content.join("\n\n");
};
try {
  const argv = yargs
    .option("config", {
      alias: "c",
      description: "Path to config file",
      default: "../config.yaml",
      type: "string",
    })
    .option("out", {
      alias: "o",
      description: "output file path",
      default: "./README.md",
      type: "string",
    })
    .help()
    .alias("help", "h").argv;
  console.log("Reading config file from:", argv.config);
  const file = fs.readFileSync(argv.config, "utf8");
  const data = yaml.load(file);
  const content = generateReadme(data);
  fs.writeFileSync(argv.out, content);
  console.log("File successfully generated at:", argv.out);
} catch (e) {
  console.error("Error", e);
  process.exit(1);
}
