import {
    Dependency,
    DependencyCategory,
    DependencyHelpLink,
    DependencyName,
    MavenDependency,
    Platform,
    PlatformStarter
} from "@/globals";

export const gitIgnore = `target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/
`

export const gitAttributes = `/mvnw text eol=lf
*.cmd text eol=crlf
`

export const mavenWrapperProperties = `# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
wrapperVersion=3.3.2
distributionType=only-script
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
`

export const pingCommandContent = (mainClass: string) => `package ${mainClass.substring(0, mainClass.lastIndexOf('.'))};
    
import picocli.CommandLine.*;
import xyz.quartzframework.core.bean.annotation.Injectable;
import java.util.concurrent.Callable;

@Injectable
@Command(name = "ping")
public class PingCommand implements Callable<String> {

  @Override
  public String call() {
    return "Pong!";
  }
}
`;

export const mainClassContent = (mainClass: string, platform: string, className: string = 'Main') => {
    return `package ${mainClass.substring(0, mainClass.lastIndexOf('.'))};
    
import xyz.quartzframework.core.QuartzApplication;
import xyz.quartzframework.${platform.toLowerCase()}.${PlatformStarter[platform as Platform]};

@QuartzApplication
public class ${className} extends ${PlatformStarter[platform as Platform]} {

  @Override
  public void main() {
    builder(this).build();
  }
}
`
};

export const pluginYaml = (mainClass: string) => `name: '@project.name@'
version: '@project.version@'
main: '${mainClass}'
`;

export const mavenXml = (name: string, version: string, groupId: string, artifactId: string, javaVersion: string, isSnapshot: boolean, platform: string, platformApiDep: { groupId: string, artifactId: string }, platformApiVersion: string, dependencies: string[]) => {
    const dependencyXml = dependencies.map(dep => {
    const category = (Object.keys(MavenDependency) as DependencyCategory[]).find(cat =>
        MavenDependency[cat]?.[dep as Dependency]
    );

    const depInfo = category ? MavenDependency[category][dep as Dependency] : undefined;
    if (!depInfo) return '';

    const optional = depInfo.optional ? `\n      <optional>true</optional>` : '';
    const scope = depInfo.scope ? `\n      <scope>${depInfo.scope}</scope>` : '';
    return `\n    <dependency>\n      <groupId>${depInfo.groupId}</groupId>\n      <artifactId>${depInfo.artifactId}</artifactId>${scope}${optional}\n    </dependency>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>xyz.quartzframework</groupId>
    <artifactId>quartz-starter-parent</artifactId>
    <version>${version}</version>
    <relativePath/>
  </parent>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <name>${name}</name>
  <version>1.0.0-SNAPSHOT</version>
  
  <properties>
    <java.version>${javaVersion}</java.version>
    <maven.compiler.source>${javaVersion}</maven.compiler.source>
    <maven.compiler.target>${javaVersion}</maven.compiler.target>
  </properties>
  ${isSnapshot ? `\n  <repositories>
      <repository>
        <id>sonatype-central</id>
        <url>https://central.sonatype.com/repository/maven-snapshots</url>
        <releases>
            <enabled>false</enabled>
        </releases>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
      </repository>
  </repositories>\n` : ''}
  <dependencies>
    <dependency>
      <groupId>xyz.quartzframework</groupId>
      <artifactId>quartz-${platform.toLowerCase()}-plugin-starter</artifactId>
    </dependency>
    <dependency>
      <groupId>${platformApiDep.groupId}</groupId>
      <artifactId>${platformApiDep.artifactId}</artifactId>
      <version>${platformApiVersion}</version>
      <scope>provided</scope>
    </dependency>${dependencyXml}
  </dependencies>
  
  <build>
    <resources>
      <resource>
        <directory>src/main/resources</directory>
        <filtering>true</filtering>
      </resource>
    </resources>
    <plugins>
      <plugin>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.8.1</version>
        <configuration>
          <source>${javaVersion}</source>
          <target>${javaVersion}</target>
          <compilerArgs><arg>-parameters</arg></compilerArgs>
        </configuration>
      </plugin>
      <plugin>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.2.4</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals><goal>shade</goal></goals>
          </execution>
        </executions>
        <configuration><createDependencyReducedPom>false</createDependencyReducedPom></configuration>
      </plugin>
    </plugins>
  </build>
</project>
    `
}

export const readme = (name: string, dependencies: string[]) => {
    const deps = (dependencies as string[]).map(dep => {
        const depInfo = DependencyName[dep as Dependency];
        return `- [${depInfo}](${DependencyHelpLink[dep as Dependency]})`;
    }).join('\n');
    return `# ${name}

This plugin was generated using [Quartz Framework](https://quartzframework.xyz).

## Links

- Documentation: [quartzframework.xyz](https://quartzframework.xyz)
- GitHub: [github.com/quartz-framework](https://github.com/quartz-framework)

## Helpful Links

${deps}

`
}

export const mvnw = '#!/bin/sh\n' +
    '# ----------------------------------------------------------------------------\n' +
    '# Licensed to the Apache Software Foundation (ASF) under one\n' +
    '# or more contributor license agreements.  See the NOTICE file\n' +
    '# distributed with this work for additional information\n' +
    '# regarding copyright ownership.  The ASF licenses this file\n' +
    '# to you under the Apache License, Version 2.0 (the\n' +
    '# "License"); you may not use this file except in compliance\n' +
    '# with the License.  You may obtain a copy of the License at\n' +
    '#\n' +
    '#    https://www.apache.org/licenses/LICENSE-2.0\n' +
    '#\n' +
    '# Unless required by applicable law or agreed to in writing,\n' +
    '# software distributed under the License is distributed on an\n' +
    '# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n' +
    '# KIND, either express or implied.  See the License for the\n' +
    '# specific language governing permissions and limitations\n' +
    '# under the License.\n' +
    '# ----------------------------------------------------------------------------\n' +
    '\n' +
    '# ----------------------------------------------------------------------------\n' +
    '# Apache Maven Wrapper startup batch script, version 3.2.0\n' +
    '#\n' +
    '# Required ENV vars:\n' +
    '# ------------------\n' +
    '#   JAVA_HOME - location of a JDK home dir\n' +
    '#\n' +
    '# Optional ENV vars\n' +
    '# -----------------\n' +
    '#   MAVEN_OPTS - parameters passed to the Java VM when running Maven\n' +
    '#     e.g. to debug Maven itself, use\n' +
    '#       set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000\n' +
    '#   MAVEN_SKIP_RC - flag to disable loading of mavenrc files\n' +
    '# ----------------------------------------------------------------------------\n' +
    '\n' +
    'if [ -z "$MAVEN_SKIP_RC" ] ; then\n' +
    '\n' +
    '  if [ -f /usr/local/etc/mavenrc ] ; then\n' +
    '    . /usr/local/etc/mavenrc\n' +
    '  fi\n' +
    '\n' +
    '  if [ -f /etc/mavenrc ] ; then\n' +
    '    . /etc/mavenrc\n' +
    '  fi\n' +
    '\n' +
    '  if [ -f "$HOME/.mavenrc" ] ; then\n' +
    '    . "$HOME/.mavenrc"\n' +
    '  fi\n' +
    '\n' +
    'fi\n' +
    '\n' +
    '# OS specific support.  $var _must_ be set to either true or false.\n' +
    'cygwin=false;\n' +
    'darwin=false;\n' +
    'mingw=false\n' +
    'case "$(uname)" in\n' +
    '  CYGWIN*) cygwin=true ;;\n' +
    '  MINGW*) mingw=true;;\n' +
    '  Darwin*) darwin=true\n' +
    '    # Use /usr/libexec/java_home if available, otherwise fall back to /Library/Java/Home\n' +
    '    # See https://developer.apple.com/library/mac/qa/qa1170/_index.html\n' +
    '    if [ -z "$JAVA_HOME" ]; then\n' +
    '      if [ -x "/usr/libexec/java_home" ]; then\n' +
    '        JAVA_HOME="$(/usr/libexec/java_home)"; export JAVA_HOME\n' +
    '      else\n' +
    '        JAVA_HOME="/Library/Java/Home"; export JAVA_HOME\n' +
    '      fi\n' +
    '    fi\n' +
    '    ;;\n' +
    'esac\n' +
    '\n' +
    'if [ -z "$JAVA_HOME" ] ; then\n' +
    '  if [ -r /etc/gentoo-release ] ; then\n' +
    '    JAVA_HOME=$(java-config --jre-home)\n' +
    '  fi\n' +
    'fi\n' +
    '\n' +
    '# For Cygwin, ensure paths are in UNIX format before anything is touched\n' +
    'if $cygwin ; then\n' +
    '  [ -n "$JAVA_HOME" ] &&\n' +
    '    JAVA_HOME=$(cygpath --unix "$JAVA_HOME")\n' +
    '  [ -n "$CLASSPATH" ] &&\n' +
    '    CLASSPATH=$(cygpath --path --unix "$CLASSPATH")\n' +
    'fi\n' +
    '\n' +
    '# For Mingw, ensure paths are in UNIX format before anything is touched\n' +
    'if $mingw ; then\n' +
    '  [ -n "$JAVA_HOME" ] && [ -d "$JAVA_HOME" ] &&\n' +
    '    JAVA_HOME="$(cd "$JAVA_HOME" || (echo "cannot cd into $JAVA_HOME."; exit 1); pwd)"\n' +
    'fi\n' +
    '\n' +
    'if [ -z "$JAVA_HOME" ]; then\n' +
    '  javaExecutable="$(which javac)"\n' +
    '  if [ -n "$javaExecutable" ] && ! [ "$(expr "\\"$javaExecutable\\"" : \'\\([^ ]*\\)\')" = "no" ]; then\n' +
    '    # readlink(1) is not available as standard on Solaris 10.\n' +
    '    readLink=$(which readlink)\n' +
    '    if [ ! "$(expr "$readLink" : \'\\([^ ]*\\)\')" = "no" ]; then\n' +
    '      if $darwin ; then\n' +
    '        javaHome="$(dirname "\\"$javaExecutable\\"")"\n' +
    '        javaExecutable="$(cd "\\"$javaHome\\"" && pwd -P)/javac"\n' +
    '      else\n' +
    '        javaExecutable="$(readlink -f "\\"$javaExecutable\\"")"\n' +
    '      fi\n' +
    '      javaHome="$(dirname "\\"$javaExecutable\\"")"\n' +
    '      javaHome=$(expr "$javaHome" : \'\\(.*\\)/bin\')\n' +
    '      JAVA_HOME="$javaHome"\n' +
    '      export JAVA_HOME\n' +
    '    fi\n' +
    '  fi\n' +
    'fi\n' +
    '\n' +
    'if [ -z "$JAVACMD" ] ; then\n' +
    '  if [ -n "$JAVA_HOME"  ] ; then\n' +
    '    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then\n' +
    '      # IBM\'s JDK on AIX uses strange locations for the executables\n' +
    '      JAVACMD="$JAVA_HOME/jre/sh/java"\n' +
    '    else\n' +
    '      JAVACMD="$JAVA_HOME/bin/java"\n' +
    '    fi\n' +
    '  else\n' +
    '    JAVACMD="$(\\unset -f command 2>/dev/null; \\command -v java)"\n' +
    '  fi\n' +
    'fi\n' +
    '\n' +
    'if [ ! -x "$JAVACMD" ] ; then\n' +
    '  echo "Error: JAVA_HOME is not defined correctly." >&2\n' +
    '  echo "  We cannot execute $JAVACMD" >&2\n' +
    '  exit 1\n' +
    'fi\n' +
    '\n' +
    'if [ -z "$JAVA_HOME" ] ; then\n' +
    '  echo "Warning: JAVA_HOME environment variable is not set."\n' +
    'fi\n' +
    '\n' +
    '# traverses directory structure from process work directory to filesystem root\n' +
    '# first directory with .mvn subdirectory is considered project base directory\n' +
    'find_maven_basedir() {\n' +
    '  if [ -z "$1" ]\n' +
    '  then\n' +
    '    echo "Path not specified to find_maven_basedir"\n' +
    '    return 1\n' +
    '  fi\n' +
    '\n' +
    '  basedir="$1"\n' +
    '  wdir="$1"\n' +
    '  while [ "$wdir" != \'/\' ] ; do\n' +
    '    if [ -d "$wdir"/.mvn ] ; then\n' +
    '      basedir=$wdir\n' +
    '      break\n' +
    '    fi\n' +
    '    # workaround for JBEAP-8937 (on Solaris 10/Sparc)\n' +
    '    if [ -d "${wdir}" ]; then\n' +
    '      wdir=$(cd "$wdir/.." || exit 1; pwd)\n' +
    '    fi\n' +
    '    # end of workaround\n' +
    '  done\n' +
    '  printf \'%s\' "$(cd "$basedir" || exit 1; pwd)"\n' +
    '}\n' +
    '\n' +
    '# concatenates all lines of a file\n' +
    'concat_lines() {\n' +
    '  if [ -f "$1" ]; then\n' +
    '    # Remove \\r in case we run on Windows within Git Bash\n' +
    '    # and check out the repository with auto CRLF management\n' +
    '    # enabled. Otherwise, we may read lines that are delimited with\n' +
    '    # \\r\\n and produce $\'-Xarg\\r\' rather than -Xarg due to word\n' +
    '    # splitting rules.\n' +
    '    tr -s \'\\r\\n\' \' \' < "$1"\n' +
    '  fi\n' +
    '}\n' +
    '\n' +
    'log() {\n' +
    '  if [ "$MVNW_VERBOSE" = true ]; then\n' +
    '    printf \'%s\\n\' "$1"\n' +
    '  fi\n' +
    '}\n' +
    '\n' +
    'BASE_DIR=$(find_maven_basedir "$(dirname "$0")")\n' +
    'if [ -z "$BASE_DIR" ]; then\n' +
    '  exit 1;\n' +
    'fi\n' +
    '\n' +
    'MAVEN_PROJECTBASEDIR=${MAVEN_BASEDIR:-"$BASE_DIR"}; export MAVEN_PROJECTBASEDIR\n' +
    'log "$MAVEN_PROJECTBASEDIR"\n' +
    '\n' +
    '##########################################################################################\n' +
    '# Extension to allow automatically downloading the maven-wrapper.jar from Maven-central\n' +
    '# This allows using the maven wrapper in projects that prohibit checking in binary data.\n' +
    '##########################################################################################\n' +
    'wrapperJarPath="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"\n' +
    'if [ -r "$wrapperJarPath" ]; then\n' +
    '    log "Found $wrapperJarPath"\n' +
    'else\n' +
    '    log "Couldn\'t find $wrapperJarPath, downloading it ..."\n' +
    '\n' +
    '    if [ -n "$MVNW_REPOURL" ]; then\n' +
    '      wrapperUrl="$MVNW_REPOURL/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"\n' +
    '    else\n' +
    '      wrapperUrl="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"\n' +
    '    fi\n' +
    '    while IFS="=" read -r key value; do\n' +
    '      # Remove \'\\r\' from value to allow usage on windows as IFS does not consider \'\\r\' as a separator ( considers space, tab, new line (\'\\n\'), and custom \'=\' )\n' +
    '      safeValue=$(echo "$value" | tr -d \'\\r\')\n' +
    '      case "$key" in (wrapperUrl) wrapperUrl="$safeValue"; break ;;\n' +
    '      esac\n' +
    '    done < "$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"\n' +
    '    log "Downloading from: $wrapperUrl"\n' +
    '\n' +
    '    if $cygwin; then\n' +
    '      wrapperJarPath=$(cygpath --path --windows "$wrapperJarPath")\n' +
    '    fi\n' +
    '\n' +
    '    if command -v wget > /dev/null; then\n' +
    '        log "Found wget ... using wget"\n' +
    '        [ "$MVNW_VERBOSE" = true ] && QUIET="" || QUIET="--quiet"\n' +
    '        if [ -z "$MVNW_USERNAME" ] || [ -z "$MVNW_PASSWORD" ]; then\n' +
    '            wget $QUIET "$wrapperUrl" -O "$wrapperJarPath" || rm -f "$wrapperJarPath"\n' +
    '        else\n' +
    '            wget $QUIET --http-user="$MVNW_USERNAME" --http-password="$MVNW_PASSWORD" "$wrapperUrl" -O "$wrapperJarPath" || rm -f "$wrapperJarPath"\n' +
    '        fi\n' +
    '    elif command -v curl > /dev/null; then\n' +
    '        log "Found curl ... using curl"\n' +
    '        [ "$MVNW_VERBOSE" = true ] && QUIET="" || QUIET="--silent"\n' +
    '        if [ -z "$MVNW_USERNAME" ] || [ -z "$MVNW_PASSWORD" ]; then\n' +
    '            curl $QUIET -o "$wrapperJarPath" "$wrapperUrl" -f -L || rm -f "$wrapperJarPath"\n' +
    '        else\n' +
    '            curl $QUIET --user "$MVNW_USERNAME:$MVNW_PASSWORD" -o "$wrapperJarPath" "$wrapperUrl" -f -L || rm -f "$wrapperJarPath"\n' +
    '        fi\n' +
    '    else\n' +
    '        log "Falling back to using Java to download"\n' +
    '        javaSource="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/MavenWrapperDownloader.java"\n' +
    '        javaClass="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/MavenWrapperDownloader.class"\n' +
    '        # For Cygwin, switch paths to Windows format before running javac\n' +
    '        if $cygwin; then\n' +
    '          javaSource=$(cygpath --path --windows "$javaSource")\n' +
    '          javaClass=$(cygpath --path --windows "$javaClass")\n' +
    '        fi\n' +
    '        if [ -e "$javaSource" ]; then\n' +
    '            if [ ! -e "$javaClass" ]; then\n' +
    '                log " - Compiling MavenWrapperDownloader.java ..."\n' +
    '                ("$JAVA_HOME/bin/javac" "$javaSource")\n' +
    '            fi\n' +
    '            if [ -e "$javaClass" ]; then\n' +
    '                log " - Running MavenWrapperDownloader.java ..."\n' +
    '                ("$JAVA_HOME/bin/java" -cp .mvn/wrapper MavenWrapperDownloader "$wrapperUrl" "$wrapperJarPath") || rm -f "$wrapperJarPath"\n' +
    '            fi\n' +
    '        fi\n' +
    '    fi\n' +
    'fi\n' +
    '##########################################################################################\n' +
    '# End of extension\n' +
    '##########################################################################################\n' +
    '\n' +
    '# If specified, validate the SHA-256 sum of the Maven wrapper jar file\n' +
    'wrapperSha256Sum=""\n' +
    'while IFS="=" read -r key value; do\n' +
    '  case "$key" in (wrapperSha256Sum) wrapperSha256Sum=$value; break ;;\n' +
    '  esac\n' +
    'done < "$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"\n' +
    'if [ -n "$wrapperSha256Sum" ]; then\n' +
    '  wrapperSha256Result=false\n' +
    '  if command -v sha256sum > /dev/null; then\n' +
    '    if echo "$wrapperSha256Sum  $wrapperJarPath" | sha256sum -c > /dev/null 2>&1; then\n' +
    '      wrapperSha256Result=true\n' +
    '    fi\n' +
    '  elif command -v shasum > /dev/null; then\n' +
    '    if echo "$wrapperSha256Sum  $wrapperJarPath" | shasum -a 256 -c > /dev/null 2>&1; then\n' +
    '      wrapperSha256Result=true\n' +
    '    fi\n' +
    '  else\n' +
    '    echo "Checksum validation was requested but neither \'sha256sum\' or \'shasum\' are available."\n' +
    '    echo "Please install either command, or disable validation by removing \'wrapperSha256Sum\' from your maven-wrapper.properties."\n' +
    '    exit 1\n' +
    '  fi\n' +
    '  if [ $wrapperSha256Result = false ]; then\n' +
    '    echo "Error: Failed to validate Maven wrapper SHA-256, your Maven wrapper might be compromised." >&2\n' +
    '    echo "Investigate or delete $wrapperJarPath to attempt a clean download." >&2\n' +
    '    echo "If you updated your Maven version, you need to update the specified wrapperSha256Sum property." >&2\n' +
    '    exit 1\n' +
    '  fi\n' +
    'fi\n' +
    '\n' +
    'MAVEN_OPTS="$(concat_lines "$MAVEN_PROJECTBASEDIR/.mvn/jvm.config") $MAVEN_OPTS"\n' +
    '\n' +
    '# For Cygwin, switch paths to Windows format before running java\n' +
    'if $cygwin; then\n' +
    '  [ -n "$JAVA_HOME" ] &&\n' +
    '    JAVA_HOME=$(cygpath --path --windows "$JAVA_HOME")\n' +
    '  [ -n "$CLASSPATH" ] &&\n' +
    '    CLASSPATH=$(cygpath --path --windows "$CLASSPATH")\n' +
    '  [ -n "$MAVEN_PROJECTBASEDIR" ] &&\n' +
    '    MAVEN_PROJECTBASEDIR=$(cygpath --path --windows "$MAVEN_PROJECTBASEDIR")\n' +
    'fi\n' +
    '\n' +
    '# Provide a "standardized" way to retrieve the CLI args that will\n' +
    '# work with both Windows and non-Windows executions.\n' +
    'MAVEN_CMD_LINE_ARGS="$MAVEN_CONFIG $*"\n' +
    'export MAVEN_CMD_LINE_ARGS\n' +
    '\n' +
    'WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain\n' +
    '\n' +
    '# shellcheck disable=SC2086 # safe args\n' +
    'exec "$JAVACMD" \\\n' +
    '  $MAVEN_OPTS \\\n' +
    '  $MAVEN_DEBUG_OPTS \\\n' +
    '  -classpath "$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar" \\\n' +
    '  "-Dmaven.multiModuleProjectDirectory=${MAVEN_PROJECTBASEDIR}" \\\n' +
    '  ${WRAPPER_LAUNCHER} $MAVEN_CONFIG "$@"\n'

export const mvnwCMD = '@REM ----------------------------------------------------------------------------\n' +
    '@REM Licensed to the Apache Software Foundation (ASF) under one\n' +
    '@REM or more contributor license agreements.  See the NOTICE file\n' +
    '@REM distributed with this work for additional information\n' +
    '@REM regarding copyright ownership.  The ASF licenses this file\n' +
    '@REM to you under the Apache License, Version 2.0 (the\n' +
    '@REM "License"); you may not use this file except in compliance\n' +
    '@REM with the License.  You may obtain a copy of the License at\n' +
    '@REM\n' +
    '@REM    https://www.apache.org/licenses/LICENSE-2.0\n' +
    '@REM\n' +
    '@REM Unless required by applicable law or agreed to in writing,\n' +
    '@REM software distributed under the License is distributed on an\n' +
    '@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n' +
    '@REM KIND, either express or implied.  See the License for the\n' +
    '@REM specific language governing permissions and limitations\n' +
    '@REM under the License.\n' +
    '@REM ----------------------------------------------------------------------------\n' +
    '\n' +
    '@REM ----------------------------------------------------------------------------\n' +
    '@REM Apache Maven Wrapper startup batch script, version 3.2.0\n' +
    '@REM\n' +
    '@REM Required ENV vars:\n' +
    '@REM JAVA_HOME - location of a JDK home dir\n' +
    '@REM\n' +
    '@REM Optional ENV vars\n' +
    '@REM MAVEN_BATCH_ECHO - set to \'on\' to enable the echoing of the batch commands\n' +
    '@REM MAVEN_BATCH_PAUSE - set to \'on\' to wait for a keystroke before ending\n' +
    '@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven\n' +
    '@REM     e.g. to debug Maven itself, use\n' +
    '@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000\n' +
    '@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files\n' +
    '@REM ----------------------------------------------------------------------------\n' +
    '\n' +
    '@REM Begin all REM lines with \'@\' in case MAVEN_BATCH_ECHO is \'on\'\n' +
    '@echo off\n' +
    '@REM set title of command window\n' +
    'title %0\n' +
    '@REM enable echoing by setting MAVEN_BATCH_ECHO to \'on\'\n' +
    '@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%\n' +
    '\n' +
    '@REM set %HOME% to equivalent of $HOME\n' +
    'if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")\n' +
    '\n' +
    '@REM Execute a user defined script before this one\n' +
    'if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre\n' +
    '@REM check for pre script, once with legacy .bat ending and once with .cmd ending\n' +
    'if exist "%USERPROFILE%\\mavenrc_pre.bat" call "%USERPROFILE%\\mavenrc_pre.bat" %*\n' +
    'if exist "%USERPROFILE%\\mavenrc_pre.cmd" call "%USERPROFILE%\\mavenrc_pre.cmd" %*\n' +
    ':skipRcPre\n' +
    '\n' +
    '@setlocal\n' +
    '\n' +
    'set ERROR_CODE=0\n' +
    '\n' +
    '@REM To isolate internal variables from possible post scripts, we use another setlocal\n' +
    '@setlocal\n' +
    '\n' +
    '@REM ==== START VALIDATION ====\n' +
    'if not "%JAVA_HOME%" == "" goto OkJHome\n' +
    '\n' +
    'echo.\n' +
    'echo Error: JAVA_HOME not found in your environment. >&2\n' +
    'echo Please set the JAVA_HOME variable in your environment to match the >&2\n' +
    'echo location of your Java installation. >&2\n' +
    'echo.\n' +
    'goto error\n' +
    '\n' +
    ':OkJHome\n' +
    'if exist "%JAVA_HOME%\\bin\\java.exe" goto init\n' +
    '\n' +
    'echo.\n' +
    'echo Error: JAVA_HOME is set to an invalid directory. >&2\n' +
    'echo JAVA_HOME = "%JAVA_HOME%" >&2\n' +
    'echo Please set the JAVA_HOME variable in your environment to match the >&2\n' +
    'echo location of your Java installation. >&2\n' +
    'echo.\n' +
    'goto error\n' +
    '\n' +
    '@REM ==== END VALIDATION ====\n' +
    '\n' +
    ':init\n' +
    '\n' +
    '@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".\n' +
    '@REM Fallback to current working directory if not found.\n' +
    '\n' +
    'set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%\n' +
    'IF NOT "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir\n' +
    '\n' +
    'set EXEC_DIR=%CD%\n' +
    'set WDIR=%EXEC_DIR%\n' +
    ':findBaseDir\n' +
    'IF EXIST "%WDIR%"\\.mvn goto baseDirFound\n' +
    'cd ..\n' +
    'IF "%WDIR%"=="%CD%" goto baseDirNotFound\n' +
    'set WDIR=%CD%\n' +
    'goto findBaseDir\n' +
    '\n' +
    ':baseDirFound\n' +
    'set MAVEN_PROJECTBASEDIR=%WDIR%\n' +
    'cd "%EXEC_DIR%"\n' +
    'goto endDetectBaseDir\n' +
    '\n' +
    ':baseDirNotFound\n' +
    'set MAVEN_PROJECTBASEDIR=%EXEC_DIR%\n' +
    'cd "%EXEC_DIR%"\n' +
    '\n' +
    ':endDetectBaseDir\n' +
    '\n' +
    'IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config" goto endReadAdditionalConfig\n' +
    '\n' +
    '@setlocal EnableExtensions EnableDelayedExpansion\n' +
    'for /F "usebackq delims=" %%a in ("%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config") do set JVM_CONFIG_MAVEN_PROPS=!JVM_CONFIG_MAVEN_PROPS! %%a\n' +
    '@endlocal & set JVM_CONFIG_MAVEN_PROPS=%JVM_CONFIG_MAVEN_PROPS%\n' +
    '\n' +
    ':endReadAdditionalConfig\n' +
    '\n' +
    'SET MAVEN_JAVA_EXE="%JAVA_HOME%\\bin\\java.exe"\n' +
    'set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.jar"\n' +
    'set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain\n' +
    '\n' +
    'set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"\n' +
    '\n' +
    'FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.properties") DO (\n' +
    '    IF "%%A"=="wrapperUrl" SET WRAPPER_URL=%%B\n' +
    ')\n' +
    '\n' +
    '@REM Extension to allow automatically downloading the maven-wrapper.jar from Maven-central\n' +
    '@REM This allows using the maven wrapper in projects that prohibit checking in binary data.\n' +
    'if exist %WRAPPER_JAR% (\n' +
    '    if "%MVNW_VERBOSE%" == "true" (\n' +
    '        echo Found %WRAPPER_JAR%\n' +
    '    )\n' +
    ') else (\n' +
    '    if not "%MVNW_REPOURL%" == "" (\n' +
    '        SET WRAPPER_URL="%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"\n' +
    '    )\n' +
    '    if "%MVNW_VERBOSE%" == "true" (\n' +
    '        echo Couldn\'t find %WRAPPER_JAR%, downloading it ...\n' +
    '        echo Downloading from: %WRAPPER_URL%\n' +
    '    )\n' +
    '\n' +
    '    powershell -Command "&{"^\n' +
    '\t\t"$webclient = new-object System.Net.WebClient;"^\n' +
    '\t\t"if (-not ([string]::IsNullOrEmpty(\'%MVNW_USERNAME%\') -and [string]::IsNullOrEmpty(\'%MVNW_PASSWORD%\'))) {"^\n' +
    '\t\t"$webclient.Credentials = new-object System.Net.NetworkCredential(\'%MVNW_USERNAME%\', \'%MVNW_PASSWORD%\');"^\n' +
    '\t\t"}"^\n' +
    '\t\t"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile(\'%WRAPPER_URL%\', \'%WRAPPER_JAR%\')"^\n' +
    '\t\t"}"\n' +
    '    if "%MVNW_VERBOSE%" == "true" (\n' +
    '        echo Finished downloading %WRAPPER_JAR%\n' +
    '    )\n' +
    ')\n' +
    '@REM End of extension\n' +
    '\n' +
    '@REM If specified, validate the SHA-256 sum of the Maven wrapper jar file\n' +
    'SET WRAPPER_SHA_256_SUM=""\n' +
    'FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.properties") DO (\n' +
    '    IF "%%A"=="wrapperSha256Sum" SET WRAPPER_SHA_256_SUM=%%B\n' +
    ')\n' +
    'IF NOT %WRAPPER_SHA_256_SUM%=="" (\n' +
    '    powershell -Command "&{"^\n' +
    '       "$hash = (Get-FileHash \\"%WRAPPER_JAR%\\" -Algorithm SHA256).Hash.ToLower();"^\n' +
    '       "If(\'%WRAPPER_SHA_256_SUM%\' -ne $hash){"^\n' +
    '       "  Write-Output \'Error: Failed to validate Maven wrapper SHA-256, your Maven wrapper might be compromised.\';"^\n' +
    '       "  Write-Output \'Investigate or delete %WRAPPER_JAR% to attempt a clean download.\';"^\n' +
    '       "  Write-Output \'If you updated your Maven version, you need to update the specified wrapperSha256Sum property.\';"^\n' +
    '       "  exit 1;"^\n' +
    '       "}"^\n' +
    '       "}"\n' +
    '    if ERRORLEVEL 1 goto error\n' +
    ')\n' +
    '\n' +
    '@REM Provide a "standardized" way to retrieve the CLI args that will\n' +
    '@REM work with both Windows and non-Windows executions.\n' +
    'set MAVEN_CMD_LINE_ARGS=%*\n' +
    '\n' +
    '%MAVEN_JAVA_EXE% ^\n' +
    '  %JVM_CONFIG_MAVEN_PROPS% ^\n' +
    '  %MAVEN_OPTS% ^\n' +
    '  %MAVEN_DEBUG_OPTS% ^\n' +
    '  -classpath %WRAPPER_JAR% ^\n' +
    '  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^\n' +
    '  %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*\n' +
    'if ERRORLEVEL 1 goto error\n' +
    'goto end\n' +
    '\n' +
    ':error\n' +
    'set ERROR_CODE=1\n' +
    '\n' +
    ':end\n' +
    '@endlocal & set ERROR_CODE=%ERROR_CODE%\n' +
    '\n' +
    'if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost\n' +
    '@REM check for post script, once with legacy .bat ending and once with .cmd ending\n' +
    'if exist "%USERPROFILE%\\mavenrc_post.bat" call "%USERPROFILE%\\mavenrc_post.bat"\n' +
    'if exist "%USERPROFILE%\\mavenrc_post.cmd" call "%USERPROFILE%\\mavenrc_post.cmd"\n' +
    ':skipRcPost\n' +
    '\n' +
    '@REM pause the script if MAVEN_BATCH_PAUSE is set to \'on\'\n' +
    'if "%MAVEN_BATCH_PAUSE%"=="on" pause\n' +
    '\n' +
    'if "%MAVEN_TERMINATE_CMD%"=="on" exit %ERROR_CODE%\n' +
    '\n' +
    'cmd /C exit /B %ERROR_CODE%\n'