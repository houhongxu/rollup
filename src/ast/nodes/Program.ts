import { locate } from 'locate-character';
import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import { LOGLEVEL_INFO, LOGLEVEL_WARN } from '../../utils/logging';
import { logFirstSideEffect, logInvalidAnnotation } from '../../utils/logs';
import {
	findFirstLineBreakOutsideComment,
	type RenderOptions,
	renderStatementList
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as nodes from './node-unions';
import type { ProgramParent } from './node-unions';
import type * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class Program extends NodeBase<ast.Program> {
	parent!: ProgramParent;
	body!: readonly (nodes.Statement | nodes.ModuleDeclaration)[];
	sourceType!: 'module';
	type!: NodeType.tProgram;
	invalidAnnotations?: readonly ast.Annotation[];

	private hasCachedEffect: boolean | null = null;
	private hasLoggedEffect = false;

	hasCachedEffects(): boolean {
		if (!this.included) {
			return false;
		}
		return this.hasCachedEffect === null
			? (this.hasCachedEffect = this.hasEffects(createHasEffectsContext()))
			: this.hasCachedEffect;
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const node of this.body) {
			if (node.hasEffects(context)) {
				if (this.scope.context.options.experimentalLogSideEffects && !this.hasLoggedEffect) {
					this.hasLoggedEffect = true;
					const { code, log, module } = this.scope.context;
					log(
						LOGLEVEL_INFO,
						logFirstSideEffect(code, module.id, locate(code, node.start, { offsetLine: 1 })!),
						node.start
					);
				}
				return (this.hasCachedEffect = true);
			}
		}
		return false;
	}

	includePath(
		_path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context)) {
				node.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
			}
		}
	}

	initialise() {
		super.initialise();
		if (this.invalidAnnotations)
			for (const { start, end, type } of this.invalidAnnotations) {
				this.scope.context.magicString.remove(start, end);
				if (type === 'pure' || type === 'noSideEffects') {
					this.scope.context.log(
						LOGLEVEL_WARN,
						logInvalidAnnotation(
							this.scope.context.code.slice(start, end),
							this.scope.context.module.id,
							type
						),
						start
					);
				}
			}
	}

	render(code: MagicString, options: RenderOptions): void {
		let start = this.start;
		if (code.original.startsWith('#!')) {
			start = Math.min(code.original.indexOf('\n') + 1, this.end);
			code.remove(0, start);
		}
		if (this.body.length > 0) {
			// Keep all consecutive lines that start with a comment
			while (code.original[start] === '/' && /[*/]/.test(code.original[start + 1])) {
				const firstLineBreak = findFirstLineBreakOutsideComment(
					code.original.slice(start, this.body[0].start)
				);
				if (firstLineBreak[0] === -1) {
					break;
				}
				start += firstLineBreak[1];
			}
			renderStatementList(this.body, code, start, this.end, options);
		} else {
			super.render(code, options);
		}
	}

	protected applyDeoptimizations() {}
}
