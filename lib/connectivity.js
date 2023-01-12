import isReachable from 'is-reachable';
import {domainURL} from './constants.js';

export async function isForumReachable() {
    return isReachable(domainURL).then(reachable => reachable);
}
