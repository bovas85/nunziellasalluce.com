import { actions } from './index.js';
import { assertEquals } from '../test-utils.js';

// Mocking setTimeout
const originalSetTimeout = global.setTimeout;
let timeouts = [];
global.setTimeout = (callback, delay) => {
  timeouts.push({ callback, delay });
  return timeouts.length;
};

const flushTimeouts = () => {
  const currentTimeouts = [...timeouts].sort((a, b) => a.delay - b.delay);
  timeouts = [];
  currentTimeouts.forEach(t => t.callback());
};

const testShowMenu = async () => {
  const committed = [];
  const commit = (name) => committed.push(name);

  await actions.showMenu({ commit });

  assertEquals(committed, [], 'showMenu should not commit anything immediately');
  assertEquals(timeouts.length, 2, 'showMenu should have registered 2 timeouts');

  flushTimeouts();

  assertEquals(committed, ['showMenuBg', 'showMenuBgDone'], 'showMenu commits expected mutations after timeouts');
};

const testNuxtServerInit = async () => {
  const committed = [];
  const commit = (name, data) => committed.push({ name, data });
  const mockProjects = [{ slug: 'project-1' }];
  const context = {
    $http: {
      $get: async () => mockProjects
    }
  };

  await actions.nuxtServerInit.call(context, { commit });

  assertEquals(committed.length, 1, 'nuxtServerInit commits one mutation');
  assertEquals(committed[0].name, 'setProjects', 'nuxtServerInit commits setProjects');
  assertEquals(committed[0].data, mockProjects, 'nuxtServerInit commits expected projects');
};

const testResetScroll = () => {
  const committed = [];
  const commit = (name) => committed.push(name);

  // Mock process.browser and document
  const originalBrowser = global.process.browser;
  global.process.browser = true;
  const mockBody = { style: { overflow: '' } };
  global.document = {
    querySelector: (selector) => selector === 'body' ? mockBody : null
  };

  actions.resetScroll({ commit });

  assertEquals(mockBody.style.overflow, 'auto', 'resetScroll sets body overflow to auto');
  assertEquals(committed, ['resetMenus'], 'resetScroll commits resetMenus');

  // Clean up
  delete global.document;
  global.process.browser = originalBrowser;
};

const runTests = async () => {
  try {
    console.log('Running testShowMenu...');
    await testShowMenu();
    console.log('Running testNuxtServerInit...');
    await testNuxtServerInit();
    console.log('Running testResetScroll...');
    testResetScroll();
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('\nTest failed!');
    console.error(error);
    process.exit(1);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
};

runTests();
