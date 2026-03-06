import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, connection } from "./client.js";
import { companies } from "./schema/companies.js";

type NewCompanySeed = {
  name: string;
  slug: string;
  description: string;
  website: string;
  foundedYear: number;
  hqLocation: string;
  isPublic: boolean;
  ticker?: string;
  sector:
    | "launch"
    | "satellite"
    | "ground_segment"
    | "analytics"
    | "manufacturing"
    | "services"
    | "other";
  subSector?: string;
  tags?: string[];
};

const SEED_COMPANIES: NewCompanySeed[] = [
  {
    name: "SpaceX",
    slug: "spacex",
    description:
      "SpaceX designs, manufactures and launches advanced rockets and spacecraft, having developed the world's first fully reusable orbital rocket and operating the Starlink satellite constellation.",
    website: "https://www.spacex.com",
    foundedYear: 2002,
    hqLocation: "Hawthorne, CA",
    isPublic: false,
    sector: "launch",
    subSector: "orbital_launch",
    tags: ["launch", "satellites", "reusability", "starlink", "starship"],
  },
  {
    name: "Rocket Lab",
    slug: "rocket-lab",
    description:
      "Rocket Lab is an end-to-end space company providing dedicated small satellite launch services via its Electron rocket and developing the medium-lift Neutron vehicle.",
    website: "https://www.rocketlabusa.com",
    foundedYear: 2006,
    hqLocation: "Long Beach, CA",
    isPublic: true,
    ticker: "RKLB",
    sector: "launch",
    subSector: "small_launch",
    tags: ["smallsat", "electron", "neutron", "rideshare"],
  },
  {
    name: "Virgin Galactic",
    slug: "virgin-galactic",
    description:
      "Virgin Galactic is a human spaceflight company developing and operating suborbital spaceplane experiences for space tourism and point-to-point travel.",
    website: "https://www.virgingalactic.com",
    foundedYear: 2004,
    hqLocation: "Truth or Consequences, NM",
    isPublic: true,
    ticker: "SPCE",
    sector: "launch",
    subSector: "suborbital",
    tags: ["space_tourism", "suborbital", "spaceplane"],
  },
  {
    name: "Astra Space",
    slug: "astra-space",
    description:
      "Astra Space is a rocket company building low-cost, high-cadence orbital launch vehicles targeting the small satellite market.",
    website: "https://www.astra.com",
    foundedYear: 2016,
    hqLocation: "Alameda, CA",
    isPublic: true,
    ticker: "ASTR",
    sector: "launch",
    subSector: "small_launch",
    tags: ["smallsat", "orbital", "launch_vehicle"],
  },
  {
    name: "Planet Labs",
    slug: "planet-labs",
    description:
      "Planet Labs operates the world's largest fleet of Earth-imaging satellites, delivering daily global coverage for agriculture, government, and enterprise customers.",
    website: "https://www.planet.com",
    foundedYear: 2010,
    hqLocation: "San Francisco, CA",
    isPublic: true,
    ticker: "PL",
    sector: "satellite",
    subSector: "earth_observation",
    tags: ["earth_observation", "imaging", "analytics", "smallsat"],
  },
  {
    name: "Maxar Technologies",
    slug: "maxar-technologies",
    description:
      "Maxar Technologies is a leading provider of advanced space technology solutions including high-resolution Earth imagery, satellite components, and space infrastructure.",
    website: "https://www.maxar.com",
    foundedYear: 1969,
    hqLocation: "Westminster, CO",
    isPublic: false,
    sector: "satellite",
    subSector: "earth_observation",
    tags: ["earth_observation", "geospatial", "satellite_manufacturing", "government"],
  },
  {
    name: "L3Harris Technologies",
    slug: "l3harris-technologies",
    description:
      "L3Harris Technologies is a defense technology company providing advanced space systems, intelligence, surveillance, and reconnaissance capabilities to government and commercial customers.",
    website: "https://www.l3harris.com",
    foundedYear: 2019,
    hqLocation: "Melbourne, FL",
    isPublic: true,
    ticker: "LHX",
    sector: "manufacturing",
    subSector: "defense_space",
    tags: ["defense", "satellites", "sensors", "government"],
  },
  {
    name: "Northrop Grumman",
    slug: "northrop-grumman",
    description:
      "Northrop Grumman is a global aerospace and defense technology company building spacecraft, satellites, and launch systems including the Antares rocket and Cygnus cargo spacecraft.",
    website: "https://www.northropgrumman.com",
    foundedYear: 1939,
    hqLocation: "Falls Church, VA",
    isPublic: true,
    ticker: "NOC",
    sector: "manufacturing",
    subSector: "defense_space",
    tags: ["defense", "satellites", "launch", "spacecraft", "government"],
  },
  {
    name: "Lockheed Martin",
    slug: "lockheed-martin",
    description:
      "Lockheed Martin is an aerospace, defense, and technology company and one of the world's largest contractors, producing satellites, spacecraft, and space systems for government and commercial customers.",
    website: "https://www.lockheedmartin.com",
    foundedYear: 1995,
    hqLocation: "Bethesda, MD",
    isPublic: true,
    ticker: "LMT",
    sector: "manufacturing",
    subSector: "defense_space",
    tags: ["defense", "satellites", "spacecraft", "government", "launch"],
  },
  {
    name: "Boeing",
    slug: "boeing",
    description:
      "Boeing's space division develops and manufactures satellites, launch systems, and human spacecraft including the CST-100 Starliner crew vehicle and participates in the Space Launch System program.",
    website: "https://www.boeing.com",
    foundedYear: 1916,
    hqLocation: "Arlington, VA",
    isPublic: true,
    ticker: "BA",
    sector: "manufacturing",
    subSector: "defense_space",
    tags: ["defense", "human_spaceflight", "launch", "satellites", "government"],
  },
  {
    name: "Blue Origin",
    slug: "blue-origin",
    description:
      "Blue Origin is a private aerospace company developing reusable launch vehicles including New Shepard for suborbital tourism and New Glenn for orbital missions, founded by Jeff Bezos.",
    website: "https://www.blueorigin.com",
    foundedYear: 2000,
    hqLocation: "Kent, WA",
    isPublic: false,
    sector: "launch",
    subSector: "orbital_launch",
    tags: ["reusability", "new_shepard", "new_glenn", "space_tourism", "orbital"],
  },
  {
    name: "Relativity Space",
    slug: "relativity-space",
    description:
      "Relativity Space is an aerospace company pioneering 3D-printed rockets, developing the medium-lift Terran R reusable launch vehicle for the small and medium satellite market.",
    website: "https://www.relativityspace.com",
    foundedYear: 2015,
    hqLocation: "Long Beach, CA",
    isPublic: false,
    sector: "launch",
    subSector: "orbital_launch",
    tags: ["3d_printing", "additive_manufacturing", "smallsat", "reusability"],
  },
  {
    name: "Firefly Aerospace",
    slug: "firefly-aerospace",
    description:
      "Firefly Aerospace provides end-to-end launch and lunar transportation services through its Alpha launch vehicle and Blue Ghost lunar lander for commercial and government missions.",
    website: "https://www.fireflyspace.com",
    foundedYear: 2017,
    hqLocation: "Cedar Park, TX",
    isPublic: false,
    sector: "launch",
    subSector: "small_launch",
    tags: ["smallsat", "alpha", "lunar", "lander"],
  },
  {
    name: "ABL Space Systems",
    slug: "abl-space-systems",
    description:
      "ABL Space Systems develops the RS1 small orbital launch vehicle with a focus on rapid production and deployment from austere launch sites for government and commercial customers.",
    website: "https://www.ablspacesystems.com",
    foundedYear: 2017,
    hqLocation: "El Segundo, CA",
    isPublic: false,
    sector: "launch",
    subSector: "small_launch",
    tags: ["smallsat", "rs1", "government", "defense"],
  },
  {
    name: "Astrobotic Technology",
    slug: "astrobotic",
    description:
      "Astrobotic Technology is a Pittsburgh-based space robotics company developing lunar landers and rovers to deliver payloads to the Moon for NASA and commercial customers.",
    website: "https://www.astrobotic.com",
    foundedYear: 2007,
    hqLocation: "Pittsburgh, PA",
    isPublic: false,
    sector: "services",
    subSector: "lunar_delivery",
    tags: ["lunar", "lander", "robotics", "nasa", "clps"],
  },
  {
    name: "Intuitive Machines",
    slug: "intuitive-machines",
    description:
      "Intuitive Machines designs and operates lunar landers through NASA's Commercial Lunar Payload Services program and provides space infrastructure and data services.",
    website: "https://www.intuitivemachines.com",
    foundedYear: 2013,
    hqLocation: "Houston, TX",
    isPublic: true,
    ticker: "LUNR",
    sector: "services",
    subSector: "lunar_delivery",
    tags: ["lunar", "lander", "nasa", "clps", "nova-c"],
  },
  {
    name: "Redwire",
    slug: "redwire",
    description:
      "Redwire is a space infrastructure company providing mission-critical spacecraft components, deployable structures, and in-space manufacturing capabilities for government and commercial customers.",
    website: "https://www.redwirespace.com",
    foundedYear: 2020,
    hqLocation: "Jacksonville, FL",
    isPublic: true,
    ticker: "RDW",
    sector: "manufacturing",
    subSector: "spacecraft_components",
    tags: ["spacecraft_components", "deployables", "in-space_manufacturing", "government"],
  },
  {
    name: "Terran Orbital",
    slug: "terran-orbital",
    description:
      "Terran Orbital is a manufacturer of small satellites for government and commercial customers, producing CubeSats and microsatellites across a range of applications.",
    website: "https://www.terranorbital.com",
    foundedYear: 2013,
    hqLocation: "Boca Raton, FL",
    isPublic: true,
    ticker: "LLAP",
    sector: "manufacturing",
    subSector: "smallsat_manufacturing",
    tags: ["cubesat", "smallsat", "manufacturing", "government"],
  },
  {
    name: "Spire Global",
    slug: "spire-global",
    description:
      "Spire Global operates a constellation of multi-purpose nanosatellites providing data services including weather forecasting, maritime tracking, and aviation monitoring.",
    website: "https://www.spire.com",
    foundedYear: 2012,
    hqLocation: "Vienna, VA",
    isPublic: true,
    ticker: "SPIR",
    sector: "analytics",
    subSector: "space_data",
    tags: ["data_as_a_service", "weather", "maritime", "ais", "nanosatellite"],
  },
  {
    name: "BlackSky Technology",
    slug: "blacksky-technology",
    description:
      "BlackSky provides real-time geospatial intelligence through its constellation of high-frequency Earth-observation satellites and AI-powered analytics platform.",
    website: "https://www.blacksky.com",
    foundedYear: 2013,
    hqLocation: "Herndon, VA",
    isPublic: true,
    ticker: "BKSY",
    sector: "analytics",
    subSector: "geospatial_intelligence",
    tags: ["earth_observation", "geospatial", "ai_analytics", "government"],
  },
  {
    name: "Iridium Communications",
    slug: "iridium-communications",
    description:
      "Iridium operates the world's only truly global satellite communications network, providing voice and data services in every corner of the globe via its 66-satellite LEO constellation.",
    website: "https://www.iridium.com",
    foundedYear: 1991,
    hqLocation: "McLean, VA",
    isPublic: true,
    ticker: "IRDM",
    sector: "satellite",
    subSector: "communications",
    tags: ["satellite_communications", "iot", "leo", "maritime", "aviation"],
  },
  {
    name: "Viasat",
    slug: "viasat",
    description:
      "Viasat is a global communications company providing satellite broadband internet services for residential, aviation, maritime, and government customers through its GEO and planned LEO satellite fleet.",
    website: "https://www.viasat.com",
    foundedYear: 1986,
    hqLocation: "Carlsbad, CA",
    isPublic: true,
    ticker: "VSAT",
    sector: "satellite",
    subSector: "broadband",
    tags: ["broadband", "satellite_internet", "geo", "aviation", "government"],
  },
  {
    name: "SES",
    slug: "ses",
    description:
      "SES is a Luxembourg-based satellite operator running one of the world's largest and most diverse satellite fleets, delivering video and data connectivity services globally across GEO and MEO orbits.",
    website: "https://www.ses.com",
    foundedYear: 1985,
    hqLocation: "Betzdorf, Luxembourg",
    isPublic: true,
    ticker: "SESG",
    sector: "satellite",
    subSector: "communications",
    tags: ["broadcasting", "broadband", "geo", "meo", "o3b"],
  },
  {
    name: "Telesat",
    slug: "telesat",
    description:
      "Telesat is a Canadian satellite operator and developer of the Lightspeed LEO constellation, designed to provide high-throughput, low-latency global broadband connectivity.",
    website: "https://www.telesat.com",
    foundedYear: 1969,
    hqLocation: "Ottawa, Ontario",
    isPublic: true,
    ticker: "TSAT",
    sector: "satellite",
    subSector: "broadband",
    tags: ["broadband", "leo", "lightspeed", "geo", "satellite_internet"],
  },
  {
    name: "OneWeb",
    slug: "oneweb",
    description:
      "OneWeb operates a LEO broadband satellite constellation providing high-speed connectivity to governments, enterprises, and mobile network operators in underserved regions worldwide.",
    website: "https://www.oneweb.net",
    foundedYear: 2012,
    hqLocation: "London, UK",
    isPublic: false,
    sector: "satellite",
    subSector: "broadband",
    tags: ["broadband", "leo", "satellite_internet", "government", "enterprise"],
  },
  {
    name: "Amazon (Project Kuiper)",
    slug: "amazon-project-kuiper",
    description:
      "Amazon's Project Kuiper is developing a 3,236-satellite LEO constellation to deliver high-speed broadband internet to underserved communities and Amazon Web Services edge customers globally.",
    website: "https://www.amazon.com/kuiper",
    foundedYear: 2019,
    hqLocation: "Redmond, WA",
    isPublic: true,
    ticker: "AMZN",
    sector: "satellite",
    subSector: "broadband",
    tags: ["broadband", "leo", "satellite_internet", "aws", "kuiper"],
  },
  {
    name: "Arianespace",
    slug: "arianespace",
    description:
      "Arianespace is a French launch service provider operating the Ariane 5 and Ariane 6 heavy-lift rockets along with Soyuz and Vega vehicles from Europe's spaceport in French Guiana.",
    website: "https://www.arianespace.com",
    foundedYear: 1980,
    hqLocation: "Courcouronnes, France",
    isPublic: false,
    sector: "launch",
    subSector: "heavy_lift",
    tags: ["heavy_lift", "ariane", "commercial_launch", "esa", "geo"],
  },
  {
    name: "Indian Space Research Organisation",
    slug: "isro",
    description:
      "ISRO is India's national space agency, developing launch vehicles including PSLV and GSLV, operating communication and earth observation satellites, and executing lunar and interplanetary missions.",
    website: "https://www.isro.gov.in",
    foundedYear: 1969,
    hqLocation: "Bengaluru, India",
    isPublic: false,
    sector: "launch",
    subSector: "government_launch",
    tags: ["government", "pslv", "gslv", "lunar", "earth_observation"],
  },
  {
    name: "Mitsubishi Heavy Industries",
    slug: "mitsubishi-heavy-industries",
    description:
      "Mitsubishi Heavy Industries develops and operates the H-IIA and H3 launch vehicles for JAXA and commercial customers, providing access to geostationary and sun-synchronous orbits.",
    website: "https://www.mhi.com",
    foundedYear: 1884,
    hqLocation: "Tokyo, Japan",
    isPublic: true,
    ticker: "7011.T",
    sector: "launch",
    subSector: "heavy_lift",
    tags: ["h-iia", "h3", "jaxa", "government", "geostationary"],
  },
  {
    name: "China Aerospace Science and Technology Corporation",
    slug: "casc",
    description:
      "CASC is China's main state-owned space contractor, developing and launching the Long March family of rockets and building satellites for communications, earth observation, and crewed spaceflight.",
    website: "http://www.spacechina.com",
    foundedYear: 1999,
    hqLocation: "Beijing, China",
    isPublic: false,
    sector: "launch",
    subSector: "government_launch",
    tags: ["long_march", "government", "crewed_spaceflight", "satellites", "bds"],
  },
];

async function seed(): Promise<void> {
  console.log(`Seeding ${SEED_COMPANIES.length} companies...`);

  for (const company of SEED_COMPANIES) {
    process.stdout.write(`  Upserting: ${company.name}...`);

    await db
      .insert(companies)
      .values(company)
      .onConflictDoUpdate({
        target: companies.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          website: sql`excluded.website`,
          foundedYear: sql`excluded.founded_year`,
          hqLocation: sql`excluded.hq_location`,
          isPublic: sql`excluded.is_public`,
          ticker: sql`excluded.ticker`,
          sector: sql`excluded.sector`,
          subSector: sql`excluded.sub_sector`,
          tags: sql`excluded.tags`,
          updatedAt: sql`now()`,
        },
      });

    console.log(" done");
  }

  console.log(`\nSeeding complete! ${SEED_COMPANIES.length} companies upserted.`);
}

seed()
  .catch((err: unknown) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    void connection.end();
    process.exit(0);
  });
