FROM mcr.microsoft.com/devcontainers/typescript-node:dev-18-bookworm

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
RUN apt install git-lfs -y \
	&& apt-get clean
