// pages/api/generate.ts
import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { PlatformYaml, Compiler, Platform } from '@/globals'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    groupId,
    artifactId,
    name,
    mainClass,
    javaVersion,
    platform,
    compiler,
    version,
    dependencies,
  } = body

  const isSnapshot = version.endsWith('-SNAPSHOT')
  const zip = new JSZip()
  const basePath = `${artifactId}/`
  const pluginYamlName = PlatformYaml[platform as Platform] || 'plugin.yml'

  const dependencyXml = dependencies.map(
      (dep: string) => `    <dependency>
      <groupId>xyz.quartzframework</groupId>
      <artifactId>${dep}</artifactId>
    </dependency>`
  ).join('\n')

  const mavenXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>xyz.quartzframework</groupId>
    <artifactId>quartz-parent</artifactId>
    <version>${version}</version>
    <relativePath/>
  </parent>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <properties>
    <java.version>${javaVersion}</java.version>
    <maven.compiler.source>${javaVersion}</maven.compiler.source>
    <maven.compiler.target>${javaVersion}</maven.compiler.target>
  </properties>
  ${isSnapshot ? `
  <repositories>
    <repository>
      <id>snapshots</id>
      <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
      <snapshots>
        <enabled>true</enabled>
      </snapshots>
    </repository>
  </repositories>` : ''}

  <dependencies>
    <dependency>
      <groupId>xyz.quartzframework</groupId>
      <artifactId>quartz-${platform.toLowerCase()}-plugin-starter</artifactId>
    </dependency>
    ${dependencyXml}
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.8.1</version>
        <configuration>
          <source>${javaVersion}</source>
          <target>${javaVersion}</target>
          <compilerArgs>
            <arg>-parameters</arg>
          </compilerArgs>
        </configuration>
      </plugin>
      <plugin>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.2.4</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <createDependencyReducedPom>false</createDependencyReducedPom>
        </configuration>
      </plugin>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>2.22.2</version>
      </plugin>
      <plugin>
        <artifactId>maven-failsafe-plugin</artifactId>
        <version>2.22.2</version>
      </plugin>
    </plugins>
  </build>
</project>`

  const pluginYaml = `name: ${name}
version: 1.0.0
main: ${mainClass}`

  const mainClassContent = `import xyz.quartzframework.core.QuartzApplication;
import xyz.quartzframework.${platform.toLowerCase()}.${platform === 'SPIGOT' ? 'SpigotPlugin' : 'BungeePlugin'};
import xyz.quartzframework.core.command.annotation.Command;
import xyz.quartzframework.core.bean.annotation.Injectable;

import java.util.concurrent.Callable;

@QuartzApplication
public class ${mainClass.split('.').pop()} extends ${platform === 'SPIGOT' ? 'SpigotPlugin' : 'BungeePlugin'} {
  @Override
  public void main() {
    builder(this).build();
  }

  @Injectable
  @Command(name = "ping")
  public static class PingCommand implements Callable<String> {
    @Override
    public String call() {
      return "Pong!";
    }
  }
}`

  // Adiciona arquivos usando caminhos diretos (sem zip.folder)
  zip.file(`${basePath}pom.xml`, compiler === Compiler.MAVEN ? mavenXml : 'TODO: Gradle support')
  zip.file(`${basePath}src/main/resources/${pluginYamlName}`, pluginYaml)
  zip.file(`${basePath}src/main/java/${mainClass.replaceAll('.', '/')}.java`, mainClassContent)

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    platform: 'UNIX',
    streamFiles: true,
  });

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${artifactId}.zip"`,
    },
  })
}