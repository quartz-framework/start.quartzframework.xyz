import {NextApiRequest, NextApiResponse} from 'next';
import JSZip from 'jszip';
import {Platform, PlatformApiDependency, PlatformYaml,} from '@/globals';
import {
  gitAttributes,
  gitIgnore,
  mainClassContent,
  mavenWrapperProperties,
  mavenXml,
  mvnw,
  mvnwCMD,
  pingCommandContent,
  pluginYaml,
  readme
} from "@/files";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
      platformApiVersion,
    } = req.body;

    if (!groupId || !artifactId || !name || !mainClass || !javaVersion || !platform || !compiler || !version || !dependencies || !platformApiVersion) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const isSnapshot = typeof version === 'string' && version.endsWith('-SNAPSHOT');
    const zip = new JSZip();
    const basePath = `${artifactId}/`;
    const pluginYamlName = PlatformYaml[platform as Platform] || 'plugin.yml';
    const packagePath = mainClass.substring(0, mainClass.lastIndexOf('.')).replace(/\./g, '/');
    const className = mainClass.split('.').pop()!;
    const platformApiDep = PlatformApiDependency[platform as Platform];

    zip.file(`${basePath}pom.xml`, mavenXml(name, version, groupId, artifactId, javaVersion, isSnapshot, platform, platformApiDep, platformApiVersion, dependencies));
    zip.file(`${basePath}src/main/resources/${pluginYamlName}`, pluginYaml(mainClass));
    zip.file(`${basePath}src/main/java/${packagePath}/${className}.java`, mainClassContent(mainClass, platform, className));
    zip.file(`${basePath}src/main/java/${packagePath}/PingCommand.java`, pingCommandContent(mainClass));

    zip.file(`${basePath}.gitignore`, gitIgnore);
    zip.file(`${basePath}.gitattributes`, gitAttributes);
    zip.file(`${basePath}.mvn/wrapper/maven-wrapper.properties`, mavenWrapperProperties);

    zip.file(`${basePath}README.md`, readme(name, dependencies));

    zip.file(`${basePath}mvnw`, mvnw);
    zip.file(`${basePath}mvnw.cmd`, mvnwCMD);

    const content = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      streamFiles: true,
      platform: 'UNIX',
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${artifactId}.zip"`);
    return res.status(200).send(content);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate project zip.' });
  }
}