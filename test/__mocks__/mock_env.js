export const _w = {
	setTimeout: jest.fn((fn) => fn()),
	clearTimeout: jest.fn(),
	setInterval: jest.fn((fn) => fn()),
	clearInterval: jest.fn()
};

export const isEdge = jest.fn();
