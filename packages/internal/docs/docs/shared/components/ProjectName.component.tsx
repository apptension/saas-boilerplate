import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const ProjectName = () => {
  const {
    siteConfig: {
      customFields: { projectName = 'SaaS Boilerplate' },
    },
  } = useDocusaurusContext();

  return projectName;
};

export default ProjectName;
