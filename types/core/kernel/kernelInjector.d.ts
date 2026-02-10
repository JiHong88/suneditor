import type {} from '../../typedef';
export default KernelInjector;
/**
 * @description Base class for kernel consumers (plugins, modules).
 * - Provides cached access to kernel dependencies via `$` object
 * - Dependencies are built once in CoreKernel and shared across all consumers
 * - Eliminates circular references by routing through the kernel
 */
declare class KernelInjector {
	/**
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/** @type {SunEditor.Deps} */
	$: SunEditor.Deps;
}
