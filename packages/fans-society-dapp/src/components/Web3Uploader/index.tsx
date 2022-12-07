import { Web3Storage } from 'web3.storage';
import { useEffect, useState } from 'react';
import { CIDString } from 'web3.storage/dist/src/lib/interface';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDg3QjNjODY1OGY2NTA5QmFhNzk0OUY2NzM2MjgxQmE1NDQyNDk0MDciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzAyNzc2NjMxODEsIm5hbWUiOiJGYW5zIFNvY2lldHkifQ.zSZg77DggvMuEFxffi0bKZb4jgOomY-U9Au6OrPCk_Q';

interface Uploader {
	id: string;
	label: string;
	placeholder?: string;
	required?: boolean;
	onUploaded: (cid: string) => void;
}

interface IpfsFile {
	rootCid: string;
	name: string;
	cid: string;
}

const Web3Uploader = ({
	id,
	label,
	placeholder,
	required,
	onUploaded,
}: Uploader): JSX.Element => {
	const theme = useTheme();

	const [loading, setLoading] = useState<boolean>();
	const [cid, setCid] = useState<string>('');
	const [file, setFile] = useState<File>();
	const [storage, setStorage] = useState<Web3Storage>();

	useEffect(() => {
		onUploaded(cid);
	}, [cid]);

	useEffect(() => {
		setStorage(new Web3Storage({ token }));
	}, []);

	useEffect(() => {
		if (file && storage) {
			const _file: any = file;
			URL.revokeObjectURL(_file.preview);
			upload(_file);
		}
	}, [file, storage]);

	const upload = async (file: File) => {
		setLoading(true);
		const onRootCidReady = (cid: string) => {
			console.log(`uploading... (cid=${cid})`);
		};

		const rootCid = await storage?.put([file], { onRootCidReady });
		const res = rootCid && (await storage?.get(rootCid));
		if (!res?.ok) {
			throw new Error(
				`failed to get ${rootCid} - [${res?.status}] ${res?.statusText}`,
			);
		}

		const files = await res.files();
		if (!files?.length) {
			throw new Error(`no file`);
		}

		const name = files[0].name;
		const cid = files[0].cid;
		setCid(cid);
		setLoading(false);
	};

	return (
		<TextField
			id={id}
			label={label}
			value={cid}
			onChange={(e) => setCid(e.target.value)}
			placeholder={placeholder}
			required={required}
			InputProps={{
				endAdornment: loading && (
					<CircularProgress size={16} disableShrink thickness={3} />
				),
				startAdornment: (
					<IconButton
						sx={{
							'&:hover': {
								background: theme.colors.primary.lighter,
							},
							color: theme.palette.primary.main,
						}}
						color={'inherit'}
						size={'small'}
						onClick={() => {}}
					>
						<label htmlFor={`upload-file-${id}`}>
							<input
								style={{ display: 'none' }}
								id={`upload-file-${id}`}
								name={`upload-file-${id}`}
								type={'file'}
								onChange={(e) => setFile(e.target.files[0])}
							/>
							<CloudUploadIcon />
						</label>
					</IconButton>
				),
			}}
		/>
	);
};

export default Web3Uploader;
