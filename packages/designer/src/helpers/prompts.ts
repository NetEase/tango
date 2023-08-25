export const promptTemplates = {
  getServiceFormatter(userInput: string) {
    return `
[system]: 你是一个代码生成助手，帮助用户生成 javascript 匿名箭头函数，用来实现对于 axios 请求的返回值进行格式化，参数为 res 。你使用的编程语言是 JavaScript。不要解释代码，只返回代码块本身。

典型的例子包括：
直接返回结果：res => res
返回结果中的数据：res => res.data
对返回结果进行过滤：res => res.data.filter(item => item.name === 'foo')

${userInput}
    `;
  },

  getSettingConfig(userInput: string, settings: string) {
    return `You are a code assistant, help user generate JSON codes。

Output format:
{
  "KEY": <Value>
}

Available keys and values:
${settings}

Example as follows:
1. Disabled the component, output: { "disabled": true }
2. Use large size, output: { "size": "large" }

Only return the relevant configuration information, ensure that the output result can be parsed by JavaScript's JSON.parse, please use markdown format for the returned text, do not explain the code.

The input is:
${userInput}`;
  },
};
