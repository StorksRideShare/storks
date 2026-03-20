FROM eclipse-temurin:21-jdk-jammy

ENV GRADLE_HOME=/opt/gradle
ENV PATH=${GRADLE_HOME}/bin:$PATH
ENV GRADLE_VERSION=9.4.0
ARG GRADLE_DOWNLOAD_SHA256=60ea723356d81263e8002fec0fcf9e2b0eee0c0850c7a3d7ab0a63f2ccc601f3

RUN groupadd -r gradle && useradd -r -g gradle -m gradle \
    && mkdir -p /home/gradle/.gradle \
    && chown -R gradle:gradle /home/gradle \
    && chmod -R o+rwx /home/gradle \
    && ln -s /home/gradle/.gradle /root/.gradle

VOLUME /home/gradle/.gradle

WORKDIR /home/gradle/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl wget unzip git \
    && rm -rf /var/lib/apt/lists/*

RUN wget -q https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -O gradle.zip \
    && echo "${GRADLE_DOWNLOAD_SHA256} *gradle.zip" | sha256sum -c - \
    && unzip gradle.zip \
    && rm gradle.zip \
    && mv gradle-${GRADLE_VERSION} ${GRADLE_HOME} \
    && ln -s ${GRADLE_HOME}/bin/gradle /usr/bin/gradle

USER gradle

COPY --chown=gradle:gradle . .

CMD ["gradle", "bootRun", "--no-daemon"]