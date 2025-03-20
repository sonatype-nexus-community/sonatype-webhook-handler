# How to contribute

It's great you're here and reading this guide, because we need volunteers to help keep this project active and alive for the greater benefit of everyone!

- [Engaging with this project](#engaging-with-this-project)
  - [Coding Conventions](#coding-conventions)
- [Testing](#testing)
- [Submitting Contributions](#submitting-contributions)

## Engaging with this project

Here are some important resources:
- [GitHub Issues](https://github.com/sonatype-nexus-community/sonatype-webhook-handler/issues) - a place for bugs to be raised and feature requests made
- [GitHub Discussions](https://github.com/sonatype-nexus-community/sonatype-webhook-handler/discussions) - a place to discuss ideas or real-world usage


### Coding Conventions

- In order to help verify the authenticity of contributed code, we ask that your [commits be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits). 
  All commits must be signed off to show that you agree to publish your changes under the current terms and licenses of the project.
  
  Here are some notes we found helpful in configuring a local environment to automatically sign git commits:
    - [GPG commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification#gpg-commit-signature-verification)
    - [Telling Git about your GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key#telling-git-about-your-gpg-key)
    

## Testing

`jest` is used for testing - run `npm run test:unit` to run tests.


## Submitting Contributions

Please send Pull Requests that:
1. Have a singluar purpose, and that is backed by one or more GitHub Issues in this project
2. Are clear
3. Have appropriate test coverage for the Pull Requests purpose
4. Meet our Code Style Convention (see [above](#develpoment-guidelines))
5. Sign off your commits to show that you agree to publish your changes under the current terms and licenses of the project, and to indicate agreement with [Developer Certificate of Origin (DCO)](https://developercertificate.org/).