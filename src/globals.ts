export enum JavaVersion {
    JAVA_11 = '11',
    JAVA_17 = '17',
    JAVA_21 = '21',
}

export enum Platform {
    SPIGOT = 'SPIGOT',
    BUNGEE = 'BUNGEE',
}

export enum PlatformName {
    SPIGOT = 'Spigot, Paper, +Forks',
    BUNGEE = 'BungeeCord / Waterfall',
}

export enum PlatformYaml {
    SPIGOT = 'plugin.yml',
    BUNGEE = 'bungee.yml',
}

export enum PlatformStarter {
    SPIGOT = 'SpigotPlugin',
    BUNGEE = 'BungeePlugin',
}

export enum Dependency {
    LOMBOK = 'LOMBOK',
    QUARTZ_DATA_JPA = 'QUARTZ_DATA_JPA',
}

export enum DependencyName {
    LOMBOK = 'Lombok',
    QUARTZ_DATA_JPA = 'Quartz Data JPA',
}

export enum Compiler {
    MAVEN = 'MAVEN',
    //GRADLE = 'GRADLE',
}

export enum CompilerName {
    MAVEN = 'Maven',
    GRADLE = 'Gradle',
}

export enum QuartzVersion {
    "0.0.1-SNAPSHOT" = '0.0.1-SNAPSHOT',
}

export const MavenDependency: Record<Dependency, { groupId: string; artifactId: string }> = {
    [Dependency.LOMBOK]: { groupId: 'org.projectlombok', artifactId: 'lombok' },
    [Dependency.QUARTZ_DATA_JPA]: { groupId: 'xyz.quartzframework', artifactId: 'quartz-data-starter-jpa' },
};

export enum DependencyHelpLink {
    LOMBOK = 'https://projectlombok.org',
    QUARTZ_DATA_JPA = 'https://quartzframework.xyz',
}

export const PlatformApiDependency: Record<Platform, { groupId: string; artifactId: string }> = {
    [Platform.SPIGOT]: { groupId: 'org.spigotmc', artifactId: 'spigot-api' },
    [Platform.BUNGEE]: { groupId: 'net.md-5', artifactId: 'bungeecord-api' },
};

export const SupportedApiVersions: Record<Platform, string[]> = {
    [Platform.SPIGOT]: [
        '1.21.4-R0.1-SNAPSHOT',
        '1.21.3-R0.1-SNAPSHOT',
        '1.21.2-R0.1-SNAPSHOT',
        '1.21.1-R0.1-SNAPSHOT',
        '1.21-R0.1-SNAPSHOT',
        '1.20.6-R0.1-SNAPSHOT',
        '1.20.4-R0.1-SNAPSHOT',
        '1.20.3-R0.1-SNAPSHOT',
        '1.20.2-R0.1-SNAPSHOT',
        '1.20.1-R0.1-SNAPSHOT',
        '1.19.4-R0.1-SNAPSHOT',
        '1.18.2-R0.1-SNAPSHOT',
    ],
    [Platform.BUNGEE]: [
        '1.17-R0.1-SNAPSHOT',
        '1.18-R0.1-SNAPSHOT',
        '1.19-R0.1-SNAPSHOT',
    ],
};
