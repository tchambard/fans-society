import { createAction, createAsyncAction } from 'typesafe-actions';

import { contracts } from 'fans-society-contracts';
import { String } from 'lodash';

export interface IProjectsContractInfo {
	contract: contracts.Projects;
	isOwner: boolean;
	account: string;
}

export interface ICreateProjectParams {
	authorAddress: string;
	name: string;
	symbol: string;
	description: string;
	target: string;
	minInvest: string;
}

export interface IProjectListCapabilities {
	$canCreate?: boolean;
}

export interface IProjectDetailCapabilities {
	$canAbort?: boolean;
}

export enum ProjectStatus {
	Opened,
	Cancelled,
	Completed,
	Launched,
}

export interface IProjectListItem {
	id: string;
	name: string;
	description: string;
	symbol: string;
	target: number;
	minInvest: number;
	authorAddress: string;
	status: ProjectStatus;
	$capabilities: IProjectDetailCapabilities;
}

export interface IProjectDetail {
	id: string;
	name: string;
	description: string;
	symbol: string;
	target: number;
	minInvest: number;
	authorAddress: string;
	status: ProjectStatus;
	$capabilities: IProjectDetailCapabilities;
}

export interface IProjectStatusChangedEvent {
	id: string;
	status: ProjectStatus;
}

export const LOAD_PROJECTS_CONTRACT_INFO = createAsyncAction(
	'LOAD_PROJECTS_CONTRACT_INFO_REQUEST',
	'LOAD_PROJECTS_CONTRACT_INFO_SUCCESS',
	'LOAD_PROJECTS_CONTRACT_INFO_FAILURE',
)<void, IProjectsContractInfo, string>();

export const LIST_PROJECTS = createAsyncAction(
	'LIST_PROJECTS_REQUEST',
	'LIST_PROJECTS_SUCCESS',
	'LIST_PROJECTS_FAILURE',
)<void, IProjectListItem[], string>();

export const PROJECT_ADDED = createAction('PROJECT_ADDED', (action) => {
	return (project: IProjectListItem) => action(project);
});

export const CREATE_PROJECT = createAsyncAction(
	'CREATE_PROJECT_REQUEST',
	'CREATE_PROJECT_SUCCESS',
	'CREATE_PROJECT_FAILURE',
)<ICreateProjectParams, void, string>();

export const ABORT_PROJECT = createAsyncAction(
	'ABORT_PROJECT_REQUEST',
	'ABORT_PROJECT_SUCCESS',
	'ABORT_PROJECT_FAILURE',
)<string, void, string>();

export const GET_PROJECT = createAsyncAction(
	'GET_PROJECT_REQUEST',
	'GET_PROJECT_SUCCESS',
	'GET_PROJECT_FAILURE',
)<string, IProjectDetail, string>();

export const PROJECT_STATUS_CHANGED = createAction(
	'PROJECTS_STATUS_CHANGED',
	(action) => {
		return (data: IProjectStatusChangedEvent) => action(data);
	},
);

export const CLEAR_PROJECTS_TX_ERROR = createAction(
	'CLEAR_PROJECTS_TX_ERROR',
	(action) => {
		return () => action();
	},
);
