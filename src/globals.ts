export enum JavaVersion {
    // JAVA_11 = '11',
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

export enum DependencyCategory {
    DEVELOPMENT_TOOLS = 'DEVELOPMENT_TOOLS',
    SQL = 'SQL',
    UTILITY = 'UTILITY',
}

export enum DependencyCategoryName {
    DEVELOPMENT_TOOLS = 'Development Tools',
    SQL = 'SQL',
    UTILITY = 'Utility',
}

export enum Dependency {
    LOMBOK = 'LOMBOK',

    QUARTZ_DATA_JPA = 'QUARTZ_DATA_JPA',

    POSTGRESQL_DRIVER = 'POSTGRESQL_DRIVER',
    SQL_SERVER_DRIVER = 'SQL_SERVER_DRIVER',
    ORACLE_DATABASE_DRIVER = 'ORACLE_DATABASE_DRIVER',
    H2_DATABASE_DRIVER = 'H2_DATABASE_DRIVER',
    MYSQL_DRIVER = 'MYSQL_DRIVER',

    FLYWAY = 'FLYWAY',

    MINE_DOWN = 'MINE_DOWN',

}

export const DependencyMetadata: Partial<Record<Dependency, {
    allowedPlatforms?: Platform[];
    depends?: Dependency[];
    dependsIn?: Dependency[];
}>> = {
    [Dependency.QUARTZ_DATA_JPA]: {

    },

    [Dependency.FLYWAY]: {
        dependsIn: [Dependency.POSTGRESQL_DRIVER, Dependency.MYSQL_DRIVER, Dependency.H2_DATABASE_DRIVER, Dependency.ORACLE_DATABASE_DRIVER, Dependency.SQL_SERVER_DRIVER],
    },

    [Dependency.POSTGRESQL_DRIVER]: {
        depends: [Dependency.QUARTZ_DATA_JPA],
    },
    [Dependency.MYSQL_DRIVER]: {
        depends: [Dependency.QUARTZ_DATA_JPA],
    },
    [Dependency.SQL_SERVER_DRIVER]: {
        depends: [Dependency.QUARTZ_DATA_JPA],
    },
    [Dependency.ORACLE_DATABASE_DRIVER]: {
        depends: [Dependency.QUARTZ_DATA_JPA],
    },
    [Dependency.H2_DATABASE_DRIVER]: {
        depends: [Dependency.QUARTZ_DATA_JPA],
    },
    [Dependency.MINE_DOWN]: {
        allowedPlatforms: [Platform.SPIGOT, Platform.BUNGEE],
    },
};

export enum DependencyName {
    LOMBOK = 'Lombok',

    QUARTZ_DATA_JPA = 'Quartz Data JPA',

    POSTGRESQL_DRIVER = 'PostgreSQL Driver',
    SQL_SERVER_DRIVER = 'SQL Server Driver',
    ORACLE_DATABASE_DRIVER = 'Oracle JDBC Driver',
    H2_DATABASE_DRIVER = 'H2 Database',
    MYSQL_DRIVER = 'MySQL Driver',

    FLYWAY = 'Flyway',

    MINE_DOWN = 'MineDown',
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
    "0.1.0-SNAPSHOT" = '0.1.0-SNAPSHOT',
}

export const MavenDependency: Record<DependencyCategory, Partial<Record<Dependency, {
    groupId: string;
    artifactId: string;
    optional?: boolean;
    scope?: "runtime" | "compile" | "provided" | "test";
}>>> = {
    [DependencyCategory.DEVELOPMENT_TOOLS]: {
        [Dependency.LOMBOK]: {
            groupId: 'org.projectlombok',
            artifactId: 'lombok',
            optional: true,
        },
    },
    [DependencyCategory.SQL]: {
        [Dependency.QUARTZ_DATA_JPA]: {
            groupId: 'xyz.quartzframework',
            artifactId: 'quartz-starter-data-jpa',
        },
        [Dependency.POSTGRESQL_DRIVER]: {
            groupId: 'org.postgresql',
            artifactId: 'postgresql',
            scope: 'runtime',
        },
        [Dependency.SQL_SERVER_DRIVER]: {
            groupId: 'com.microsoft.sqlserver',
            artifactId: 'mssql-jdbc',
            scope: 'runtime',
        },
        [Dependency.ORACLE_DATABASE_DRIVER]: {
            groupId: 'com.oracle.database.jdbc',
            artifactId: 'ojdbc11',
            scope: 'runtime',
        },
        [Dependency.H2_DATABASE_DRIVER]: {
            groupId: 'com.h2database',
            artifactId: 'h2',
            scope: 'runtime',
        },
        [Dependency.MYSQL_DRIVER]: {
            groupId: 'com.mysql',
            artifactId: 'mysql-connector-j',
            scope: 'runtime',
        },
        [Dependency.FLYWAY]: {
            groupId: 'org.flywaydb',
            artifactId: 'flyway-core',
        },
    },
    [DependencyCategory.UTILITY]: {
        [Dependency.MINE_DOWN]: {
            groupId: 'de.themoep',
            artifactId: 'minedown',
            scope: 'compile',
        },
    },
};

export enum DependencyHelpLink {
    LOMBOK = 'https://projectlombok.org',
    QUARTZ_DATA_JPA = 'https://quartzframework.xyz/docs/data/jpa',

    POSTGRESQL_DRIVER = 'https://jdbc.postgresql.org',
    SQL_SERVER_DRIVER = 'https://learn.microsoft.com/sql/connect/jdbc',
    ORACLE_DATABASE_DRIVER = 'https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html',
    H2_DATABASE_DRIVER = 'https://h2database.com',
    MYSQL_DRIVER = 'https://dev.mysql.com/downloads/connector/j/',

    FLYWAY = 'https://documentation.red-gate.com/fd/api-java-277579358.html',

    MINE_DOWN = 'https://wiki.phoenix616.dev/library/minedown/start'
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
        // '1.19.4-R0.1-SNAPSHOT',
        // '1.18.2-R0.1-SNAPSHOT',
    ],
    [Platform.BUNGEE]: [
        // '1.17-R0.1-SNAPSHOT',
        // '1.18-R0.1-SNAPSHOT',
        '1.19-R0.1-SNAPSHOT',
    ],
};
