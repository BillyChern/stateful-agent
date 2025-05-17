// Socket.io connection
const socket = io();
let currentLab = null;

// UI Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const labsList = document.getElementById('labs-list');
const papersList = document.getElementById('papers-list');
const linkedinPostsList = document.getElementById('linkedin-posts-list');

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    loadInitialData();
});

socket.on('agent_response', (data) => {
    if (data.error) {
        appendMessage('Error', data.error, true);
    } else {
        appendMessage('Assistant', data.message);
    }
    // Refresh data after agent response
    loadInitialData();
});

// Message handling
function appendMessage(sender, message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${isError ? 'bg-red-100' : sender === 'User' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`;
    messageDiv.style.maxWidth = '80%';
    messageDiv.innerHTML = `
        <div class="font-bold text-sm">${sender}</div>
        <div class="mt-1">${message}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat_message', { message });
        appendMessage('User', message);
        messageInput.value = '';
    }
}

// Lab management
function showCreateLabModal() {
    document.getElementById('create-lab-modal').classList.remove('hidden');
}

function hideCreateLabModal() {
    document.getElementById('create-lab-modal').classList.add('hidden');
}

async function createLab() {
    const name = document.getElementById('lab-name').value;
    const institution = document.getElementById('lab-institution').value;
    const leader = document.getElementById('lab-leader').value;

    try {
        const response = await fetch('/api/labs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, institution, leader }),
        });

        if (!response.ok) throw new Error('Failed to create lab');

        hideCreateLabModal();
        loadLabs();
        
        // Also send through chat for agent processing
        const command = `Create a lab called ${name} at ${institution}, with leader ${leader}`;
        socket.emit('chat_message', { message: command });
    } catch (error) {
        appendMessage('Error', error.message, true);
    }
}

// Data loading functions
async function loadInitialData() {
    await Promise.all([
        loadLabs(),
        loadPapers(),
        loadLinkedInPosts()
    ]);
}

async function loadLabs() {
    try {
        const response = await fetch('/api/labs');
        const data = await response.json();
        
        labsList.innerHTML = '';
        if (data.labs && Array.isArray(data.labs)) {
            data.labs.forEach(lab => {
                const labDiv = document.createElement('div');
                labDiv.className = 'p-4 border rounded-lg mb-4 bg-white shadow';
                labDiv.innerHTML = `
                    <h3 class="font-bold text-lg">${lab.name || 'Unnamed Lab'}</h3>
                    <p class="text-gray-600">${lab.institution || 'No Institution'}</p>
                    <p class="mb-2">Leader: ${lab.leader || 'No Leader'}</p>
                    ${lab.website ? `<p class="text-sm mb-2"><a href="${lab.website}" target="_blank" class="text-blue-500 hover:underline">Lab Website</a></p>` : ''}
                    ${lab.description ? `<p class="text-sm text-gray-700 mb-3">${lab.description}</p>` : ''}
                    ${lab.members && lab.members.length > 0 ? `
                        <div class="mb-3">
                            <h4 class="font-semibold text-sm mb-1">Members:</h4>
                            <ul class="list-disc list-inside text-sm">
                                ${lab.members.map(member => `
                                    <li>
                                        ${member.name}
                                        ${member.scholar_url ? `
                                            <a href="${member.scholar_url}" target="_blank" class="text-blue-500 hover:underline ml-1">
                                                (Scholar)
                                            </a>
                                        ` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${lab.research_areas && lab.research_areas.length > 0 ? `
                        <div class="mb-3">
                            <h4 class="font-semibold text-sm mb-1">Research Areas:</h4>
                            <div class="flex flex-wrap gap-2">
                                ${lab.research_areas.map(area => `
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        ${area}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="flex space-x-2">
                        <button onclick="collectPapers('${lab.name}')" 
                            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                            Collect Papers
                        </button>
                        <button onclick="recommendPapers('${lab.name}')"
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                            Get Recommendations
                        </button>
                    </div>
                `;
                labsList.appendChild(labDiv);
            });
        } else {
            labsList.innerHTML = '<p class="text-gray-500">No labs found</p>';
        }
    } catch (error) {
        console.error('Failed to load labs:', error);
        appendMessage('Error', 'Failed to load labs', true);
    }
}

async function loadPapers(labName = null) {
    try {
        const url = labName ? 
            `/api/papers?lab_name=${encodeURIComponent(labName)}` : 
            '/api/papers';
        const response = await fetch(url);
        const data = await response.json();
        
        papersList.innerHTML = '';
        data.papers.forEach(paper => {
            const paperDiv = document.createElement('div');
            paperDiv.className = 'p-4 border rounded-lg';
            paperDiv.innerHTML = `
                <h3 class="font-bold">${paper.title}</h3>
                <p class="text-sm text-gray-600">${paper.authors.join(', ')}</p>
                <p class="text-sm">${paper.abstract.substring(0, 200)}...</p>
                <div class="mt-2 space-x-2">
                    <a href="${paper.url}" target="_blank" 
                        class="text-sm bg-blue-500 text-white px-2 py-1 rounded">
                        View Paper
                    </a>
                    <button onclick="shareOnLinkedIn('${paper.url}')"
                        class="text-sm bg-blue-700 text-white px-2 py-1 rounded">
                        Share on LinkedIn
                    </button>
                </div>
            `;
            papersList.appendChild(paperDiv);
        });
    } catch (error) {
        appendMessage('Error', 'Failed to load papers', true);
    }
}

async function collectPapers(labName) {
    try {
        const response = await fetch(`/api/labs/${encodeURIComponent(labName)}/papers/collect`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to collect papers');
        
        appendMessage('System', `Collecting papers for ${labName}...`);
        loadPapers(labName);
    } catch (error) {
        appendMessage('Error', error.message, true);
    }
}

async function recommendPapers(labName) {
    try {
        const response = await fetch(`/api/labs/${encodeURIComponent(labName)}/papers/recommend`);
        if (!response.ok) throw new Error('Failed to get recommendations');
        
        const data = await response.json();
        appendMessage('System', `Found ${data.papers.length} recommendations for ${labName}`);
        loadPapers(labName);
    } catch (error) {
        appendMessage('Error', error.message, true);
    }
}

async function shareOnLinkedIn(paperUrl) {
    try {
        const content = `Check out this interesting paper: ${paperUrl}`;
        const response = await fetch('/api/linkedin/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                paper_url: paperUrl
            }),
        });
        
        if (!response.ok) throw new Error('Failed to post to LinkedIn');
        
        const result = await response.json();
        appendMessage('System', `Successfully shared on LinkedIn! View post at: ${result.post_url}`);
        loadLinkedInPosts();
    } catch (error) {
        appendMessage('Error', error.message, true);
    }
}

async function loadLinkedInPosts() {
    try {
        const response = await fetch('/api/linkedin/posts');
        const data = await response.json();
        
        linkedinPostsList.innerHTML = '';
        data.posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'p-4 border rounded-lg';
            postDiv.innerHTML = `
                <div class="flex items-center space-x-2 mb-2">
                    <img src="/static/img/linkedin-icon.png" alt="LinkedIn" class="w-6 h-6">
                    <span class="text-sm text-gray-600">${new Date(post.created_at).toLocaleString()}</span>
                </div>
                <p class="text-sm">${post.content}</p>
                ${post.paper_url ? `
                    <a href="${post.paper_url}" target="_blank" class="text-sm text-blue-500 hover:underline mt-2 block">
                        View Paper
                    </a>
                ` : ''}
                <a href="${post.post_url}" target="_blank" class="text-sm text-blue-700 hover:underline mt-1 block">
                    View on LinkedIn
                </a>
            `;
            linkedinPostsList.appendChild(postDiv);
        });
    } catch (error) {
        appendMessage('Error', 'Failed to load LinkedIn posts', true);
    }
}

// Event listeners
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
}); 