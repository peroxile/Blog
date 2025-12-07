const CONFIG = {
    github: {
        repo: 'Blog',
        docsPath: 'Docs',
        branch: 'main'
    },

    ui: {
        articlesPerPage: 12,
        excerptLength: 150,
        defaultTheme: 'dark'
    },

    api: {
        baseUrl: 'https://api.github.com',
        timeOut: 5000
    }
};

function getGitHubOwner() {
    const url = window.location.href;

    const match = url.match(/https:\/\/([^.]+)\.github\.io/);

    if (match) {
        return match[1];
    }

    return 'peroxile';
}