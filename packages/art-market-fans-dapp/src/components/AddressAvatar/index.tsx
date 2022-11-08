import { Avatar } from '@mui/material';

function stringToColor(string: string) {
	let hash = 0;
	let i;

	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}

	let color = '#';

	for (i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff;
		color += `00${value.toString(16)}`.slice(-2);
	}

	return color;
}

function stringAvatar(name: string, size?: number) {
	return {
		sx: {
			width: size,
			height: size,
			bgcolor: stringToColor(name),
		},
		children: name.substring(2, 4),
	};
}

interface IProps {
	address: string;
	size?: number;
}

export default ({ address, size }: IProps) => {
	return <Avatar {...stringAvatar(address, size)} />;
};
