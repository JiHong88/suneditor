/**
 * @description Base class for kernel consumers (plugins, event orchestrator).
 * - Injects `this.$` (Deps bag) — the shared dependency object built by CoreKernel.
 * - `$` is NOT the kernel itself; it is the dependency context that the kernel provides.
 * - Eliminates circular references by routing through the Deps bag.
 */
class KernelInjector {
	/** @type {SunEditor.Deps} */
	$;

	/**
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.$ = kernel.$;
	}
}

export default KernelInjector;
