import type { ast } from '../../rollup/types';
import { getRollupError, logModuleParseError, logParseError } from '../../utils/logs';
import type { ParseErrorParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ParseError extends NodeBase<ast.ParseError> {
	parent!: ParseErrorParent;
	type!: NodeType.tParseError;
	message!: string;

	initialise() {
		const pos = this.start;
		const id = this.scope.context.module.id;
		// This simulates the current nested error structure. We could also just
		// replace it with a flat error.
		const parseError = getRollupError(logParseError(this.message, pos));
		const moduleParseError = logModuleParseError(parseError, id);
		this.scope.context.error(moduleParseError, pos);
	}
}
