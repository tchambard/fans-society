import { Box, Hidden, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const LogoWrapper = styled(Link)(
	({ theme }) => `
        color: ${theme.palette.text.primary};
        padding: ${theme.spacing(0, 1, 0, 0)};
        display: flex;
        text-decoration: none;
        font-weight: ${theme.typography.fontWeightBold};
`,
);

const LogoTextWrapper = styled(Box)(
	({ theme }) => `
        padding-left: ${theme.spacing(1)};
`,
);

const VersionBadge = styled(Box)(
	({ theme }) => `
        background: ${theme.palette.success.main};
        color: ${theme.palette.success.contrastText};
        padding: ${theme.spacing(0.4, 1)};
        border-radius: ${theme.general.borderRadiusSm};
        text-align: center;
        display: inline-block;
        line-height: 1;
        font-size: ${theme.typography.pxToRem(11)};
`,
);

const LogoText = styled(Box)(
	({ theme }) => `
        font-size: ${theme.typography.pxToRem(15)};
        font-weight: ${theme.typography.fontWeightBold};
`,
);

const EthIcon = styled('img')(
	() => `
    margin: 0 5px;
    height: 45px;
    width: 45px;
`,
);

function Logo() {
	return (
		<LogoWrapper to="/">
			<EthIcon src={'/static//images/tickets-64.png'} alt={''} />
			<Hidden smDown>
				<LogoTextWrapper>
					<Tooltip title="Version 1.0" arrow placement="right">
						<VersionBadge>1.0</VersionBadge>
					</Tooltip>
					<LogoText>Art Market Fans</LogoText>
				</LogoTextWrapper>
			</Hidden>
		</LogoWrapper>
	);
}

export default Logo;
