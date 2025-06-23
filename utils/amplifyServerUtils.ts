import { createServerRunner } from '@aws-amplify/adapter-nextjs';

let outputs: any = {};
try {
  outputs = require('@/amplify_outputs.json');
} catch (error) {
  console.warn('amplify_outputs.json not found - using empty config for development');
  outputs = {};
}

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs
});
