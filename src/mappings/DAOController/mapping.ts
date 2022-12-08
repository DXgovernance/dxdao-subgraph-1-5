import {
  DAOController,
  RegisterScheme,
  UnregisterScheme,
} from '../../types/DAOController/DAOController';

import { Scheme } from '../../types/schema';
import { Scheme as SchemeContract } from '../../types/DAOController/Scheme';

export function handleRegisterScheme(event: RegisterScheme): void {
  const controllerAddress = event.address;
  const controllerContract = DAOController.bind(controllerAddress);

  const schemeAddress = event.params._scheme;
  const schemeContract = SchemeContract.bind(schemeAddress);

  const name = schemeContract.schemeName();
  const type = schemeContract.getSchemeType();
  const avatar = schemeContract.avatar().toHexString();
  const votingMachine = schemeContract.votingMachine().toHexString();
  const controller = controllerAddress.toHexString();
  const permissionRegistry = schemeContract.permissionRegistry().toHexString();
  const maxRepPercentageChange = schemeContract.maxRepPercentageChange();

  const paramsHash = controllerContract.getSchemeParameters(schemeAddress);
  const canManageSchemes =
    controllerContract.getSchemeCanManageSchemes(schemeAddress);
  const canMakeAvatarCalls =
    controllerContract.getSchemeCanMakeAvatarCalls(schemeAddress);
  const canChangeReputation =
    controllerContract.getSchemeCanChangeReputation(schemeAddress);

  const schemeId = schemeAddress.toHexString();
  const scheme = new Scheme(schemeId);

  scheme.name = name;
  scheme.type = type;
  scheme.avatar = avatar;
  scheme.votingMachine = votingMachine;
  scheme.controller = controller;
  scheme.permissionRegistry = permissionRegistry;
  scheme.maxRepPercentageChange = maxRepPercentageChange;
  scheme.isRegistered = true;
  scheme.paramsHash = paramsHash;
  scheme.canManageSchemes = canManageSchemes;
  scheme.canMakeAvatarCalls = canMakeAvatarCalls;
  scheme.canChangeReputation = canChangeReputation;

  scheme.save();
}

export function handleUnregisterScheme(event: UnregisterScheme): void {
  const schemeAddress = event.params._scheme.toHexString();
  const scheme = Scheme.load(schemeAddress);
  if (!scheme) return;
  scheme.unset(schemeAddress);
}

