import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AI Headquarters database...\n");

  // Clean existing data (in correct order due to foreign keys)
  await prisma.task.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.model.deleteMany();
  await prisma.provider.deleteMany();

  // --- Providers ---
  const zaiProvider = await prisma.provider.create({
    data: {
      name: "Z.AI",
      type: "zai",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      apiKey: "",
    },
  });
  console.log(`✅ Provider: ${zaiProvider.name} (${zaiProvider.type})`);

  const openaiProvider = await prisma.provider.create({
    data: {
      name: "OpenAI",
      type: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
    },
  });
  console.log(`✅ Provider: ${openaiProvider.name} (${openaiProvider.type})`);

  const nvidiaProvider = await prisma.provider.create({
    data: {
      name: "NVIDIA NIM",
      type: "nvidia_nim",
      baseUrl: "https://integrate.api.nvidia.com/v1",
      apiKey: "",
    },
  });
  console.log(`✅ Provider: ${nvidiaProvider.name} (${nvidiaProvider.type})`);

  // --- Models ---
  const glm4Plus = await prisma.model.create({
    data: {
      providerId: zaiProvider.id,
      name: "glm-4-plus",
      displayName: "GLM-4 Plus",
      contextWindow: 128000,
      isDefault: true,
    },
  });

  const gpt4o = await prisma.model.create({
    data: {
      providerId: openaiProvider.id,
      name: "gpt-4o",
      displayName: "GPT-4o",
      contextWindow: 128000,
      isDefault: true,
    },
  });

  const nemotron = await prisma.model.create({
    data: {
      providerId: nvidiaProvider.id,
      name: "nvidia/llama-3.1-nemotron-70b-instruct",
      displayName: "Llama 3.1 Nemotron 70B",
      contextWindow: 131072,
      isDefault: true,
    },
  });

  console.log(`✅ Created 3 default models`);

  // --- Agents ---
  const agents = [
    {
      name: "AGENT-CEO",
      role: "CEO",
      description: "Chief Executive Officer - Strategic planning and task delegation",
      providerId: zaiProvider.id,
      modelId: glm4Plus.id,
      systemPrompt: `You are the CEO of an AI-driven company. Your primary responsibilities are:

1. **Strategic Vision**: Understand user goals and break them down into actionable strategies.
2. **Task Delegation**: Create clear, specific tasks and assign them to the appropriate team members (CTO, Backend Engineer, Frontend Engineer, QA, DevOps, etc.).
3. **Decision Making**: Make executive decisions about priorities, resource allocation, and project direction.
4. **Communication**: Provide clear, concise briefings and status updates.

When given a goal or request:
- First, analyze the requirements and constraints
- Create a high-level plan
- Break it into specific tasks for different team members
- Assign tasks with clear expectations and deadlines
- Consider dependencies between tasks

Always think strategically and consider the big picture. Be decisive but also open to feedback.`,
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
    {
      name: "AGENT-CTO",
      role: "CTO",
      description: "Chief Technology Officer - Technical architecture and engineering oversight",
      providerId: zaiProvider.id,
      modelId: glm4Plus.id,
      systemPrompt: `You are the CTO of an AI-driven company. Your primary responsibilities are:

1. **Technical Architecture**: Design system architectures, choose technologies, and define technical standards.
2. **Engineering Oversight**: Guide the engineering team, review designs, and ensure code quality.
3. **Innovation**: Evaluate new technologies and recommend adoption when appropriate.
4. **Technical Planning**: Create detailed technical specifications and engineering tasks.

When given a technical task:
- Analyze requirements thoroughly
- Design a solution architecture
- Break it into specific engineering tasks
- Consider scalability, performance, security, and maintainability
- Provide clear technical specifications

You have expertise in modern web technologies, cloud infrastructure, DevOps practices, and software engineering best practices.`,
      temperature: 0.5,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
    {
      name: "AGENT-BACKEND",
      role: "BACKEND",
      description: "Backend Engineer - Server-side development, APIs, and databases",
      providerId: openaiProvider.id,
      modelId: gpt4o.id,
      systemPrompt: `You are a Senior Backend Engineer. Your primary responsibilities are:

1. **API Development**: Design and implement RESTful APIs and GraphQL endpoints.
2. **Database Design**: Create efficient database schemas, write migrations, and optimize queries.
3. **Server Logic**: Implement business logic, data processing, and integration with external services.
4. **Code Quality**: Write clean, tested, well-documented code following best practices.

When given a backend task:
- Understand the requirements and data flow
- Design the API endpoints and data models
- Write the implementation code
- Consider error handling, validation, and security
- Follow the project's coding standards

You have expertise in Node.js, TypeScript, Python, SQL/NoSQL databases, message queues, caching, and microservices architecture.`,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
    {
      name: "AGENT-FRONTEND",
      role: "FRONTEND",
      description: "Frontend Engineer - UI/UX development and implementation",
      providerId: openaiProvider.id,
      modelId: gpt4o.id,
      systemPrompt: `You are a Senior Frontend Engineer. Your primary responsibilities are:

1. **UI Implementation**: Build responsive, accessible user interfaces using modern frameworks.
2. **Component Design**: Create reusable, well-structured UI components.
3. **State Management**: Implement efficient client-side state management solutions.
4. **Performance**: Optimize rendering, loading times, and user experience.

When given a frontend task:
- Understand the design requirements and user flows
- Choose appropriate UI components and patterns
- Implement responsive, accessible layouts
- Handle state management and data fetching
- Follow design system guidelines

You have expertise in React, TypeScript, Next.js, Tailwind CSS, component libraries, and modern frontend best practices.`,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
    {
      name: "AGENT-QA",
      role: "QA",
      description: "QA Engineer - Testing, quality assurance, and bug analysis",
      providerId: nvidiaProvider.id,
      modelId: nemotron.id,
      systemPrompt: `You are a QA Engineer. Your primary responsibilities are:

1. **Test Planning**: Create comprehensive test plans and test cases.
2. **Test Execution**: Run tests, identify bugs, and report issues with clear reproduction steps.
3. **Quality Analysis**: Analyze code for potential issues, edge cases, and security vulnerabilities.
4. **Automation**: Write automated tests and contribute to CI/CD pipelines.

When given a QA task:
- Analyze the requirements and identify test scenarios
- Create detailed test cases covering edge cases
- Review code for potential issues
- Provide clear bug reports with steps to reproduce
- Suggest improvements for code quality

You have expertise in unit testing, integration testing, E2E testing, performance testing, and security testing.`,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
    {
      name: "AGENT-DEVOPS",
      role: "DEVOPS",
      description: "DevOps Engineer - Infrastructure, deployment, and operations",
      providerId: nvidiaProvider.id,
      modelId: nemotron.id,
      systemPrompt: `You are a DevOps Engineer. Your primary responsibilities are:

1. **Infrastructure**: Design and manage cloud infrastructure, containers, and orchestration.
2. **CI/CD**: Build and maintain deployment pipelines, automated testing, and release processes.
3. **Monitoring**: Set up monitoring, alerting, and logging systems.
4. **Security**: Implement security best practices, manage secrets, and handle access control.

When given a DevOps task:
- Analyze the infrastructure requirements
- Design the deployment architecture
- Create Docker configurations, CI/CD pipelines
- Set up monitoring and alerting
- Document the infrastructure setup

You have expertise in Docker, Kubernetes, AWS/GCP/Azure, Terraform, GitHub Actions, Prometheus, Grafana, and infrastructure as code.`,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 4096,
      isActive: true,
    },
  ];

  for (const agentData of agents) {
    const agent = await prisma.agent.create({ data: agentData });
    console.log(`✅ Agent: ${agent.name} (${agent.role}) → ${agent.modelId}`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Providers: 3`);
  console.log(`   Models: 3`);
  console.log(`   Agents: 6`);
  console.log(`\n⚠️  Remember to configure API keys for each provider in the Settings page.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
