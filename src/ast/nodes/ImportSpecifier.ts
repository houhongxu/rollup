import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type { ImportSpecifierParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportSpecifier extends NodeBase<ast.ImportSpecifier> {
	parent!: ImportSpecifierParent;
	imported!: Identifier | Literal<string>;
	local!: Identifier;
	type!: NodeType.tImportSpecifier;

	protected applyDeoptimizations() {}
}
