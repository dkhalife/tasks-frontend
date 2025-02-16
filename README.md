[![Node.js CI](https://github.com/dkhalife/tasks-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/dkhalife/tasks-frontend/actions/workflows/ci.yml) [![CodeQL](https://github.com/dkhalife/tasks-frontend/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dkhalife/tasks-frontend/actions/workflows/github-code-scanning/codeql) 
[![Dependabot Updates](https://github.com/dkhalife/tasks-frontend/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/dkhalife/tasks-frontend/actions/workflows/dependabot/dependabot-updates)

## Task Wizard Frontend

This repo is a frontend for [tasks-backend](https://github.com/dkhalife/tasks-backend), a free and open source solution for task management. It started as a fork of [DoneTick](https://github.com/donetick/frontend) but has since diverged from the original source code in order to accomplish different goals. Kudos to the contributors of [DoneTick](https://github.com/donetick/frontend) for helping kickstart this project.

## Goals and principles

Task Wizard's primary goal is to allow users to own and protect their data and the following principles are ways to accomplish that:

* All the user data sent by this frontend only ever goes to a single backend
* 🔜 When data is cached on the local machine, it is encrypted with a user key
* The repo uses TypeScript with a strict set of rules designed to reduce bugs closest to development
* The code is continously scanned by a CI that runs CodeQL
* Dependencies are kept to a minimum
* When vulnerabilities are detected in dependencies they are auto updated with Dependabot

## Installation

This app is meant to be self-hosted by individuals and groups who wish to own their data and those who prioritize their data privacy. For setup instructions check out the [tasks-backend](https://github.com/dkhalife/tasks-backend) README.

## Development

1. Ensure you have [NodeJS](https://nodejs.org) 20+ installed
1. Clone the repository:
1. Navigate to the project directory: `cd path/to/cloned/repo`
1. Download dependency `yarn install`
1. Run locally `yarn start`. The output will contain instructions on how to browse the frontend.
1. Separately run the backend using instructions from [tasks-backend](https://github.com/dkhalife/tasks-backend)
1. (optionally) If using a different host for the backend, update `VITE_API_URL` in [.env](./.env)

## Contributing

Contributions are welcome! If you would like to contribute to this repo, please follow these steps:

1. Fork the repository
1. Create a new branch: `git checkout -b feature/your-feature-name`
1. Make your changes and commit them: `git commit -m 'Add some feature'`
1. Push to the branch: `git push origin feature/your-feature-name`
1. Submit a pull request

If you have ideas but aren't familiar with code, you can also [open issues](https://github.com/dkhalife/tasks-frontend/issues).

## License

See the [LICENSE](LICENSE) file for more details.
