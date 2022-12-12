import { HardhatRuntimeEnvironment } from 'hardhat/types';

const ico = {
	localhost: {
		target: '10',
		minInvest: '1',
		maxInvest: '10',
	},
	goerli: {
		target: '0.05',
		minInvest: '0.001',
		maxInvest: '0.05',
	},
	mumbai: {
		target: '0.05',
		minInvest: '0.001',
		maxInvest: '0.05',
	},
};

const partnerAddress = {
	localhost: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
	goerli: '0x5d7a8B923be416b46a41854a0A62C5D270D46B13',
	mumbai: '0x5d7a8B923be416b46a41854a0A62C5D270D46B13',
};

interface IProject {
	name: string;
	symbol: string;
	description: string;
	avatarCid: string;
	coverCid: string;
	totalSupply: string;
}

const projects: IProject[] = [
	{
		name: 'Harry Potter',
		symbol: 'HP',
		description:
			"Harry Potter, un jeune orphelin, est élevé par son oncle et sa tante qui le détestent. Alors qu'il était haut comme trois pommes, ces derniers lui ont raconté que ses parents étaient morts dans un accident de voiture. Le jour de son onzième anniversaire, Harry reçoit la visite inattendue d'un homme gigantesque se nommant Rubeus Hagrid, et celui-ci lui révèle qu'il est en fait le fils de deux puissants magiciens et qu'il possède lui aussi d'extraordinaires pouvoirs.",
		avatarCid: 'bafkreiee4qsqzbpck73volbplc5j26izwlwgrh4blq52gyejorbt6ddmla',
		coverCid: 'bafkreibxohjfo3zninklxqdl2pcpv5dy7qo665itlvojg3vvufh4gj62le',
		totalSupply: '1000000',
	},
	{
		name: 'Le parrain',
		symbol: 'TGF',
		description:
			"En 1945, à New York, les Corleone sont une des 5 familles de la mafia. Don Vito Corleone, parrain' de cette famille, marie sa fille à un bookmaker. Sollozzo, parrain' de la famille Tattaglia, propose à Don Vito une association dans le trafic de drogue, mais celui-ci refuse. Sonny, un de ses fils, y est quant à lui favorable. Afin de traiter avec Sonny, Sollozzo tente de faire tuer Don Vito, mais celui-ci en réchappe.",
		avatarCid: 'bafkreifdransn6vqwrnsoamshs4m6t7luwo6allulmp7ur34nkpzumqyp4',
		coverCid: 'bafkreibdbirvw6poutx3dl7p5sri75idn3r7yhlmvhkf6aal35t2d355wi',
		totalSupply: '9000000',
	},
	{
		name: 'Divergente',
		symbol: 'DIV',
		description:
			"Tris vit dans un monde post-apocalyptique où la société est divisée en cinq clans. À 16 ans, elle doit choisir son appartenance pour le reste de sa vie. Cas rarissime, son test d'aptitude n'est pas concluant: elle est Divergente. Les Divergentes sont des individus rares n'appartenant à aucun clan et ils sont traqués par le gouvernement. Dissimulant son secret, Tris intègre l'univers brutal des Audacieux dont l'entraînement est basé sur la maîtrise de leurs peurs les plus intimes.",
		avatarCid: 'bafkreig6xz2xgauz4kzifzriqllof6wc6aswopaol6rd7qhzjaclc34o7i',
		coverCid: 'bafkreibp2f6mts2zd73pvo4a6dqpisvtjpnbictcv452ff5u5gpsljvude',
		totalSupply: '200000',
	},
	{
		name: 'Les rivières pourpres',
		symbol: 'LRP',
		description:
			'Le même jour, à 300 km de distance, deux flics, Niémans et Max Kerkérian, se voient confier deux affaires singulières. Bientôt, les deux enquêtes vont se rejoindre.',
		avatarCid: 'bafkreifgt6h72le3m3mnz5nw4scgylczwx7tm5j3kvu37ybt33mdjnhrc4',
		coverCid: 'bafkreiaireerqcc547cwn3ts5aszrp2n3ixi6v2oq5zsrjo4tv36b2r2na',
		totalSupply: '800000',
	},
	{
		name: 'Game of Thrones',
		symbol: 'GOT',
		description:
			"Après un été de dix années, un hiver rigoureux s'abat sur le Royaume avec la promesse d'un avenir des plus sombres. Pendant ce temps, complots et rivalités se jouent sur le continent pour s'emparer du Trône de Fer, le symbole du pouvoir absolu.",
		avatarCid: 'bafkreih2332cmtpn2a5yakyizmdubcb6wimhnhkwerp5zvboy454d5ii3e',
		coverCid: 'bafkreidtyly5bjkixnktx5jupo5e5oenslni52pvlnq2d2bc4mobcfb2o4',
		totalSupply: '10000000',
	},
	{
		name: 'Breaking Bad',
		symbol: 'BB',
		description:
			"La série se concentre sur Walter White, un professeur de chimie surqualifié et père de famille, qui, ayant appris qu'il est atteint d'un cancer du poumon en phase terminale, sombre dans le crime pour assurer l'avenir financier de sa famille.",
		avatarCid: 'bafkreiaonopinbbdcwtjba2bpibp75o7chrjpzrdjk4lucnui3x366lllq',
		coverCid: 'bafkreibddzu2shgmplsnqe3agitvyrnhakwfmrmbafb3scwgjddoqnxilu',
		totalSupply: '10000',
	},
	{
		name: 'Squid Game',
		symbol: 'SG',
		description:
			"La série tourne autour d'un concours où 456 joueurs, tous en grande difficulté financière, risquent leur vie en jouant à une série de jeux d'enfants mortels pour avoir la chance de gagner un prix de ₩45,6 milliards (35 millions de dollars US, 33 millions d'euros)",
		avatarCid: 'bafkreihsi2fhmxu5yjg35bhfq5se25kwoe365a7firyomkigr5ah7vrkim',
		coverCid: 'bafkreia2lbugxgj3ydohlucvf34sctbr5qrgkqdica5krrupgpa5junopq',
		totalSupply: '2000000',
	},
	{
		name: 'Call of Duty: Modern Warfare 2',
		symbol: 'COD',
		description:
			"Call of Duty: Modern Warfare 2 se déroule 5 ans après les événements du premier Modern Warfare, lesquels sont censés se dérouler en 2011. La Russie serait en pleine guerre civile : loyalistes contre ultra-nationalistes. En même temps au Moyen-Orient, un coup d'état mené par un mouvement anti-occidental aurait eu lieu.",
		avatarCid: 'bafkreifetixtcta4kewqplzmynvbhnrj6e6wgvzzfsgblftatupndupfhm',
		coverCid: 'bafkreidbbwb5mbdhhoqjzvjv6djciojij2hd4npzs4bpsvbyc5xjxllocm',
		totalSupply: '100000',
	},
	{
		name: 'Overwatch',
		symbol: 'OW',
		description:
			"L'histoire d'Overwatch se situe dans un monde néo-futuriste (plus précisément en 2077), 30 ans aprè?s la résolution d'une guerre impliquant robots et humains (qui s'est déroulée en 2047 et a duré environ entre 3 et 4 années), appelée Crise des Omniums.",
		avatarCid: 'bafkreiggyg5pqyjottdplhoo545dopwak2wwpy4pzy4n7k6ioaq3uavzxi',
		coverCid: 'bafybeiebys2lms6d65wg56nm3l2zc7iqm4qmgvxuucbx2dcrqt33tk7k6q',
		totalSupply: '3000000',
	},
	{
		name: 'League Of Legends',
		symbol: 'LOL',
		description:
			"Dans League of Legends, le joueur contrôle un champion unique depuis une perspective isométrique (en), c'est-à-dire depuis une vue de haut. Ce champion dispose d'une attaque de base et de 5 compétences, qui peuvent avoir des effets trés divers et sont uniques à chaque champion.",
		avatarCid: 'bafkreighfp6k3iypjjlbikdce3eve5t7zwucs5ukw66ir4qhlvetxvr37i',
		coverCid: 'bafkreig5rypshbikdoi6abgyzmrqfrz5qd5qoiipq4f347tigbitgq7cxy',
		totalSupply: '100000000',
	},
	{
		name: 'Arcane',
		symbol: 'ARC',
		description:
			'Championnes de leurs villes jumelles et rivales (la huppée Piltover et la sous-terraine Zaun), deux sœurs Vi et Powder se battent dans une guerre où font rage des technologies magiques et des perspectives diamétralement opposées.',
		avatarCid: 'bafkreidrhd6imkhdzudp2thtdswhxhm77sms3q3b7bme5l5tnvldydlute',
		coverCid: 'bafkreig3g4lggofyqjuvuddwyy6aqwqxlh32b2lpgfpdt7h5w6eo5kd7by',
		totalSupply: '40000000',
	},
	{
		name: "L'attaque des titans",
		symbol: 'AT',
		description:
			"Dans un monde ravagé par des titans mangeurs d'homme depuis plus d'un siècle, les rares survivants de l'humanité n'ont d'autre choix pour survivre que de se barricader dans une cité-forteresse.",
		avatarCid: 'bafkreibtdvreblth32taek7go55fuwgvt5sgzvhaiqzoohg6tvplunm3pa',
		coverCid: 'bafkreih44hinzxg23423fuguwuh7x4uctflwszgoef2boqoxrkbgf4exmy',
		totalSupply: '100000',
	},
];

export const task__createProjects = async function (
	args: any,
	hre: HardhatRuntimeEnvironment,
) {
	const { deployments, getUnnamedAccounts } = hre;
	const { get } = deployments;

	const [deployer] = await getUnnamedAccounts();

	const amm = await get('AMM');
	const ammContract = await hre.ethers.getContractAt('AMM', amm.address);

	for (const project of projects) {
		console.log(`Create project ${project.name}...`);
		await ammContract.createProject(
			{
				name: project.name,
				symbol: project.symbol,
				description: project.description,
				avatarCid: project.avatarCid,
				coverCid: project.coverCid,
			},
			{
				target: web3.utils.toWei(ico[hre.network.name].target, 'ether'),
				minInvest: web3.utils.toWei(ico[hre.network.name].minInvest, 'ether'),
				maxInvest: web3.utils.toWei(ico[hre.network.name].maxInvest, 'ether'),
			},
			partnerAddress[hre.network.name],
			web3.utils.toWei(project.totalSupply, 'ether'),
			{
				from: deployer,
			},
		);
	}
};
