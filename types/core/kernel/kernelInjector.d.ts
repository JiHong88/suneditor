import type {} from '../../typedef';
export default KernelInjector;
/**
 * @description Base class for kernel consumers (plugins, event orchestrator).
 * - Injects `this.$` (Deps bag) — the shared dependency object built by CoreKernel.
 * - `$` is NOT the kernel itself; it is the dependency context that the kernel provides.
 * - Eliminates circular references by routing through the Deps bag.
 */
declare class KernelInjector {
	/**
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/** @type {SunEditor.Deps} */
	$: SunEditor.Deps;
}
