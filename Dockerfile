FROM ubuntu:latest
RUN apt update && apt install -y git bash
WORKDIR /repo
COPY . .
CMD ["bash"]