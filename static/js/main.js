document.addEventListener('DOMContentLoaded', function() {
    // Set up enhanced input immediately, don't wait for full load
    setupEnhancedInput();
    
    // Set up voice input immediately
    setupVoiceInput();
    
    // Loading screen
    const loadingScreen = document.getElementById('loading-screen');
    
    // Hide loading screen after resources are loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                addWelcomeMessage();
                addPredefinedQuestions();
                setupQuickQuestionsToggle();
                setupInputTooltip();
                setupThemeToggle();
                setupAccessibilitySettings();
                setupFloatingActionButton();
                setupStarfield();
                initOnboardingTips();
                addMessageInteractions();
                setupModals();
            }, 500);
        }, 800); // Show loading screen for at least 800ms for better UX
    });
    
    // Add welcome message
    function addWelcomeMessage() {
        const chatBox = document.getElementById('chat-box');
        
        // Clear any existing messages
        chatBox.innerHTML = '';
        
        // Add default welcome message
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message bot-message';
        
        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = 'Culture Guide';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = 'Welcome! I\'m your personal Culture Guide. Ask me anything about cultures, traditions, and customs from around the world.';
        
        welcomeDiv.appendChild(senderDiv);
        welcomeDiv.appendChild(contentDiv);
        chatBox.appendChild(welcomeDiv);
        
        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Setup voice input functionality
    function setupVoiceInput() {
        const micButton = document.getElementById('mic-button');
        const userInput = document.getElementById('user-input');
        const listeningIndicator = document.getElementById('listening-indicator');
        
        // Check if the browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition && micButton && userInput) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            let finalTranscript = '';
            let isListening = false;
            
            // Start/stop listening when clicking mic button
            micButton.addEventListener('click', function() {
                if (!isListening) {
                    // Start speech recognition
                    recognition.start();
                    isListening = true;
                    micButton.classList.add('listening');
                    if (listeningIndicator) listeningIndicator.classList.add('active');
                    
                    // Notify user that we're listening
                    showToast('Listening...', 1500);
                } else {
                    // Stop speech recognition
                    recognition.stop();
                    isListening = false;
                    micButton.classList.remove('listening');
                    if (listeningIndicator) listeningIndicator.classList.remove('active');
                }
            });
            
            // Process speech recognition results
            recognition.onresult = function(event) {
                finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                }
                
                // Update input with transcribed text
                if (finalTranscript) {
                    const cursorPos = userInput.selectionStart;
                    const textBefore = userInput.value.substring(0, cursorPos);
                    const textAfter = userInput.value.substring(cursorPos);
                    
                    userInput.value = textBefore + finalTranscript + textAfter;
                    userInput.focus();
                    userInput.selectionStart = cursorPos + finalTranscript.length;
                    userInput.selectionEnd = cursorPos + finalTranscript.length;
                    
                    // Trigger input event to resize textarea
                    userInput.dispatchEvent(new Event('input'));
                }
            };
            
            // Handle speech recognition end
            recognition.onend = function() {
                isListening = false;
                micButton.classList.remove('listening');
                if (listeningIndicator) listeningIndicator.classList.remove('active');
            };
            
            // Handle speech recognition errors
            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                isListening = false;
                micButton.classList.remove('listening');
                if (listeningIndicator) listeningIndicator.classList.remove('active');
                
                // Notify user about the error
                if (event.error === 'not-allowed') {
                    showToast('Microphone access denied', 3000);
                } else {
                    showToast('Speech recognition error', 3000);
                }
            };
        } else if (micButton) {
            // If speech recognition is not supported, disable the button
            micButton.style.opacity = '0.5';
            micButton.title = 'Speech recognition not supported in this browser';
            micButton.addEventListener('click', function() {
                showToast('Speech recognition not supported in this browser', 3000);
            });
        }
    }
    
    // Enhanced input features
    function setupEnhancedInput() {
        const inputContainer = document.querySelector('.input-container');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        // Auto-resize the input area as user types
        userInput.addEventListener('input', autoResizeInput);
        
        // Make sure input is focused at beginning
        if (userInput) {
            setTimeout(() => userInput.focus(), 500);
        }
        
        // Make clicking anywhere in the input area focus on the input
        inputContainer.addEventListener('click', function(e) {
            if (e.target === inputContainer) {
                userInput.focus();
            }
        });
        
        // Initialize input placeholder with typing effect
        const placeholders = [
            'Ask about Japanese festivals...',
            'Learn about Indian cuisine...',
            'Discover Mexican traditions...',
            'Explore Chinese New Year customs...',
            'Understand Italian gestures...'
        ];
        
        let currentPlaceholder = 0;
        
        function updatePlaceholder() {
            userInput.placeholder = placeholders[currentPlaceholder];
            currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        }
        
        updatePlaceholder();
        setInterval(updatePlaceholder, 5000);
        
        // Add speech-to-text functionality
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = true;
            
            const micButton = document.getElementById('mic-button');
            
            if (micButton) {
                let isListening = false;
                
                micButton.addEventListener('click', function() {
                    if (!isListening) {
                        // Start recognition
                        recognition.start();
                        isListening = true;
                        micButton.classList.add('active');
                        document.getElementById('listening-indicator').classList.add('active');
                    } else {
                        // Stop recognition
                        recognition.stop();
                        isListening = false;
                        micButton.classList.remove('active');
                        document.getElementById('listening-indicator').classList.remove('active');
                    }
                });
                
                recognition.onresult = function(event) {
                    const transcript = Array.from(event.results)
                        .map(result => result[0])
                        .map(result => result.transcript)
                        .join('');
                    
                    userInput.value = transcript;
                    userInput.dispatchEvent(new Event('input'));
                };
                
                recognition.onend = function() {
                    isListening = false;
                    micButton.classList.remove('active');
                    document.getElementById('listening-indicator').classList.remove('active');
                };
            }
        }
    }
    
    // Setup theme toggle - removed as per requirement
    function setupThemeToggle() {
        // Theme is now dark-only, so this function is essentially empty
        document.body.classList.add('dark-theme');
    }
    
    // Setup accessibility settings
    function setupAccessibilitySettings() {
        const container = document.querySelector('.container');
        
        // Create accessibility button
        const accessibilityButton = document.createElement('button');
        accessibilityButton.className = 'accessibility-button';
        accessibilityButton.setAttribute('aria-label', 'Accessibility options');
        accessibilityButton.setAttribute('title', 'Accessibility options');
        accessibilityButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Create accessibility panel
        const accessibilityPanel = document.createElement('div');
        accessibilityPanel.className = 'accessibility-panel';
        accessibilityPanel.innerHTML = `
            <h3>Accessibility Options</h3>
            <div class="accessibility-option">
                <label for="font-size">Font Size:</label>
                <div class="button-group">
                    <button class="a11y-btn" data-action="font-smaller">A-</button>
                    <button class="a11y-btn" data-action="font-reset">Reset</button>
                    <button class="a11y-btn" data-action="font-larger">A+</button>
                </div>
            </div>
            <div class="accessibility-option">
                <label for="motion-toggle">Reduce Motion:</label>
                <label class="switch">
                    <input type="checkbox" id="motion-toggle">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="accessibility-option">
                <label for="contrast-toggle">High Contrast:</label>
                <label class="switch">
                    <input type="checkbox" id="contrast-toggle">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="keyboard-shortcuts">
                <h4>Keyboard Shortcuts</h4>
                <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl+Enter</span>
                    <span class="shortcut-desc">Send message</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl+E</span>
                    <span class="shortcut-desc">Emoji picker</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl+K</span>
                    <span class="shortcut-desc">Code formatting</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-keys">Esc</span>
                    <span class="shortcut-desc">Close panels</span>
                </div>
            </div>
        `;
        
        // Add button and panel to the DOM
        container.appendChild(accessibilityButton);
        container.appendChild(accessibilityPanel);
        
        // Setup click listener for accessibility button with enhanced animation
        accessibilityButton.addEventListener('click', (e) => {
            e.preventDefault();
            accessibilityPanel.classList.toggle('visible');
            accessibilityButton.classList.toggle('active');
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.width = '100%';
            ripple.style.height = '100%';
            ripple.style.left = '0';
            ripple.style.top = '0';
            
            // Add keyframe animation to document if it doesn't exist
            if (!document.querySelector('#ripple-animation')) {
                const style = document.createElement('style');
                style.id = 'ripple-animation';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            accessibilityButton.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!accessibilityPanel.contains(e.target) && !accessibilityButton.contains(e.target)) {
                accessibilityPanel.classList.remove('visible');
                accessibilityButton.classList.remove('active');
            }
        });
        
        // Load saved settings
        const fontSize = localStorage.getItem('fontSize') || 100;
        const reduceMotion = localStorage.getItem('reduceMotion') === 'true';
        const highContrast = localStorage.getItem('highContrast') === 'true';
        
        // Apply saved settings
        document.documentElement.style.fontSize = `${fontSize}%`;
        if (reduceMotion) {
            document.body.classList.add('reduce-motion');
            document.getElementById('motion-toggle').checked = true;
        }
        if (highContrast) {
            document.body.classList.add('high-contrast');
            document.getElementById('contrast-toggle').checked = true;
        }
        
        // Font size buttons
        document.querySelectorAll('.a11y-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                let currentSize = parseInt(localStorage.getItem('fontSize') || 100);
                
                if (action === 'font-larger') {
                    currentSize = Math.min(currentSize + 10, 150);
                } else if (action === 'font-smaller') {
                    currentSize = Math.max(currentSize - 10, 80);
                } else if (action === 'font-reset') {
                    currentSize = 100;
                }
                
                document.documentElement.style.fontSize = `${currentSize}%`;
                localStorage.setItem('fontSize', currentSize.toString());
            });
        });
        
        // Reduce motion toggle
        document.getElementById('motion-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('reduce-motion');
                localStorage.setItem('reduceMotion', 'true');
            } else {
                document.body.classList.remove('reduce-motion');
                localStorage.setItem('reduceMotion', 'false');
            }
        });
        
        // High contrast toggle
        document.getElementById('contrast-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('high-contrast');
                localStorage.setItem('highContrast', 'true');
            } else {
                document.body.classList.remove('high-contrast');
                localStorage.setItem('highContrast', 'false');
            }
        });
    }
    
    // Setup quick questions toggle
    function setupQuickQuestionsToggle() {
        const toggleButton = document.getElementById('questions-toggle');
        const quickQuestions = document.getElementById('quick-questions');
        
        if (toggleButton && quickQuestions) {
            // Initialize button with text or icon
            toggleButton.innerHTML = '?';
            
            toggleButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent any default behavior
                this.classList.toggle('active');
                
                // Toggle quick questions visibility
                if (this.classList.contains('active')) {
                    quickQuestions.style.right = '20px';
                    quickQuestions.style.visibility = 'visible';
                    quickQuestions.style.opacity = '1';
                } else {
                    quickQuestions.style.right = '-350px';
                    quickQuestions.style.opacity = '0';
                    
                    setTimeout(() => {
                        quickQuestions.style.visibility = 'hidden';
                    }, 400);
                }
                
                // Create sparkle effect on click
                const buttonRect = this.getBoundingClientRect();
                const sparkleCount = 5;
                
                for (let i = 0; i < sparkleCount; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.className = 'button-sparkle';
                    
                    // Random position around button
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 20 + Math.random() * 30;
                    const posX = Math.cos(angle) * distance;
                    const posY = Math.sin(angle) * distance;
                    
                    sparkle.style.left = `calc(50% + ${posX}px)`;
                    sparkle.style.top = `calc(50% + ${posY}px)`;
                    
                    // Random size and duration
                    const size = 5 + Math.random() * 10;
                    const duration = 600 + Math.random() * 400;
                    
                    sparkle.style.width = `${size}px`;
                    sparkle.style.height = `${size}px`;
                    sparkle.style.animationDuration = `${duration}ms`;
                    
                    this.appendChild(sparkle);
                    
                    // Remove after animation
                    setTimeout(() => {
                        sparkle.remove();
                    }, duration);
                }
            });
        }
    }
    
    // Setup input tooltip animation
    function setupInputTooltip() {
        const inputTooltip = document.querySelector('.input-tooltip');
        const userInput = document.getElementById('user-input');
        
        if (!inputTooltip || !userInput) return;
        
        const showTooltip = () => {
            inputTooltip.style.opacity = '1';
            inputTooltip.style.transform = 'translateY(-10px)';
        };
        
        const hideTooltip = () => {
            inputTooltip.style.opacity = '0';
            inputTooltip.style.transform = 'translateY(0)';
        };
        
        // Show tooltip when focusing on input
        userInput.addEventListener('focus', showTooltip);
        
        // Hide tooltip when blurring from input
        userInput.addEventListener('blur', hideTooltip);
        
        // Hide tooltip when starting to type
        userInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                hideTooltip();
            } else {
                showTooltip();
            }
        });
        
        // Hide tooltip initially if input has content
        if (userInput.value.trim().length > 0) {
            hideTooltip();
        } else {
            // Show tooltip briefly, then hide it
            setTimeout(showTooltip, 1000);
            setTimeout(hideTooltip, 5000);
        }
    }
    
    // Predefined cultural questions with emojis
    function addPredefinedQuestions() {
        const questionButtonsContainer = document.querySelector('.question-buttons');
        const quickQuestionsContainer = document.getElementById('quick-questions');
        
        // Add toggle button for mobile
        if (window.innerWidth <= 768) {
            const quickTitle = document.querySelector('.quick-title');
            quickTitle.innerHTML = `<span>Quick Culture Questions</span> <button id="toggle-questions" aria-label="Toggle questions list">↕️</button>`;
            
            const toggleButton = document.getElementById('toggle-questions');
            if (toggleButton) {
                toggleButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    
                    if (questionButtonsContainer.style.maxHeight === '0px' || !questionButtonsContainer.style.maxHeight) {
                        questionButtonsContainer.style.maxHeight = '300px';
                        questionButtonsContainer.style.opacity = '1';
                        toggleButton.textContent = '↕️';
                    } else {
                        questionButtonsContainer.style.maxHeight = '0px';
                        questionButtonsContainer.style.opacity = '0';
                        toggleButton.textContent = '↔️';
                    }
                });
            }
        }
        
        // Define the questions with their respective emojis
        const predefinedQuestions = [
            { emoji: '🍜', text: 'What are popular dishes in Japan?' },
            { emoji: '💃', text: 'Traditional dances in Spain' },
            { emoji: '🎭', text: 'What are important festivals in India?' },
            { emoji: '👰', text: 'Weddings celebrated in Mexico' },
            { emoji: '🏺', text: 'History of pottery in Greece' },
            { emoji: '🎵', text: 'What music is traditional in Nigeria?' },
            { emoji: '👘', text: 'Traditional clothing in South Korea?' },
            { emoji: '🏮', text: 'New Year celebrations in China' },
            { emoji: '🕌', text: 'Religious customs in Morocco?' },
            { emoji: '🌿', text: 'Traditional medicines in Thailand?' }
        ];
        
        // Clear any existing buttons
        questionButtonsContainer.innerHTML = '';
        
        // Create and append buttons for each predefined question
        predefinedQuestions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'question-button';
            button.setAttribute('aria-label', `Ask about ${question.text}`);
            
            // Create separate elements for emoji and text to ensure proper display
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'question-emoji';
            emojiSpan.textContent = question.emoji;
            emojiSpan.setAttribute('aria-hidden', 'true'); // Hide emoji from screen readers
            
            const textSpan = document.createElement('span');
            textSpan.className = 'question-text';
            textSpan.textContent = question.text;
            
            // Append spans to button
            button.appendChild(emojiSpan);
            button.appendChild(textSpan);
            
            // Add click event listener
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                
                // Set the input value to the question text
                const userInput = document.getElementById('user-input');
                userInput.value = question.text;
                userInput.focus();
                autoResizeInput();
                
                // Auto-send the question
                sendMessage();
                
                // Close the questions panel
                const toggleButton = document.getElementById('questions-toggle');
                toggleButton.classList.remove('active');
                quickQuestionsContainer.style.right = '-350px';
                quickQuestionsContainer.style.opacity = '0';
                
                setTimeout(() => {
                    quickQuestionsContainer.style.visibility = 'hidden';
                }, 400);
            });
            
            // Initialize with opacity 0 for animation
            button.style.opacity = '0';
            button.style.transform = 'translateX(20px)';
            
            // Important: Set fixed width for the text span to ensure it wraps correctly
            textSpan.style.width = 'calc(100% - 40px)'; // Account for emoji width
            textSpan.style.display = 'inline-block';
            
            questionButtonsContainer.appendChild(button);
            
            // Trigger animation after a short delay
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateX(0)';
            }, 50);
        });
        
        // Add special visual effects for the buttons
        const questionButtons = document.querySelectorAll('.question-button');
        questionButtons.forEach(button => {
            // Add hover effects
            button.addEventListener('mouseover', () => {
                cursor.classList.add('active');
            });
            
            button.addEventListener('mouseout', () => {
                cursor.classList.remove('active');
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                if (!document.getElementById('toggle-questions')) {
                    const quickTitle = document.querySelector('.quick-title');
                    quickTitle.innerHTML = `<span>Quick Culture Questions</span> <button id="toggle-questions" aria-label="Toggle questions">↕️</button>`;
                    
                    const toggleButton = document.getElementById('toggle-questions');
                    if (toggleButton) {
                        toggleButton.addEventListener('click', () => {
                            if (questionButtonsContainer.style.display === 'none') {
                                questionButtonsContainer.style.display = 'flex';
                                toggleButton.textContent = '↕️';
                            } else {
                                questionButtonsContainer.style.display = 'none';
                                toggleButton.textContent = '↔️';
                            }
                        });
                    }
                }
            } else {
                questionButtonsContainer.style.display = 'flex';
                const quickTitle = document.querySelector('.quick-title');
                quickTitle.textContent = 'Quick Culture Questions';
            }
        });
    }
    
    // Custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add cursor effects for different elements
    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
    
    // Change cursor style for clickable elements
    const clickables = document.querySelectorAll('button, #user-input, .message-content');
    clickables.forEach(el => {
        el.addEventListener('mouseover', () => {
            cursor.classList.add('active');
        });
        
        el.addEventListener('mouseout', () => {
            cursor.classList.remove('active');
        });
    });
    
    // Special style for text input
    const textInput = document.getElementById('user-input');
    textInput.addEventListener('mouseover', () => {
        cursor.classList.add('text');
    });
    
    textInput.addEventListener('mouseout', () => {
        cursor.classList.remove('text');
    });
    
    // Auto-resize input field based on content
    function autoResizeInput() {
        // Reset field height to calculate properly
        textInput.style.height = 'auto';
        
        // Calculate content height and apply with constraints
        const scrollHeight = textInput.scrollHeight;
        const newHeight = Math.max(50, Math.min(120, scrollHeight)); // Increased min/max heights
        textInput.style.height = newHeight + 'px';
        
        // Also adjust width based on content length
        const contentLength = textInput.value.length;
        // Default width for empty or short content
        let width = '100%';
        
        // Dynamically size the input based on content
        if (contentLength > 0) {
            // Ensure minimum width but allow expansion for longer text
            // The chat bubbles will still respect max-width constraints from CSS
            textInput.style.width = '100%';
        } else {
            textInput.style.width = width;
        }
    }
    
    // Listen for input events to resize dynamically
    textInput.addEventListener('input', autoResizeInput);
    textInput.addEventListener('focus', autoResizeInput);
    textInput.addEventListener('change', autoResizeInput);
    textInput.addEventListener('keydown', function(e) {
        // Resize on Enter key press (in case of multiline input)
        if (e.key === 'Enter') {
            setTimeout(autoResizeInput, 0);
        }
    });
    
    // Resize when window changes size
    window.addEventListener('resize', autoResizeInput);
    
    // Initialize with proper height
    setTimeout(autoResizeInput, 100);
    
    // Create floating particles in chat container
    const particlesContainer = document.getElementById('particles');
    const numParticles = 15;
    
    for (let i = 0; i < numParticles; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position, size and delay
        const size = Math.random() * 12 + 5;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = Math.random() * 0.2;
        
        particlesContainer.appendChild(particle);
    }
    
    // Regularly update clickable elements (as new messages get added)
    setInterval(() => {
        const newClickables = document.querySelectorAll('button, .message-content');
        newClickables.forEach(el => {
            if (!el.hasMouseEvents) {
                el.hasMouseEvents = true;
                el.addEventListener('mouseover', () => {
                    cursor.classList.add('active');
                });
                
                el.addEventListener('mouseout', () => {
                    cursor.classList.remove('active');
                });
            }
        });
    }, 1000);
    
    // Animate title text with typing effect
    function animateTitle() {
        const titleElement = document.getElementById('title-text');
        
        // Instead of the typing animation, directly set the title with styling
        titleElement.innerHTML = 'Culture Guide Chatbot';
        
        // Add a subtle shadow animation for visibility
        titleElement.style.textShadow = '0 0 10px rgba(255, 138, 0, 0.5)';
    }
    
    // Call title animation immediately
    animateTitle();
    
    // Setup starfield
    function setupStarfield() {
        const starfield = document.getElementById('starfield');
        const stars = 350; // Increased number of stars for better density
        const shootingStarInterval = 4000; // More frequent shooting stars (every 4 seconds)
        
        // Generate initial stars with parallax layers
        const starLayers = 3; // Create multiple layers for parallax effect
        const starsPerLayer = Math.floor(stars / starLayers);
        
        for (let layer = 0; layer < starLayers; layer++) {
            for (let i = 0; i < starsPerLayer; i++) {
                createStar(layer);
            }
        }
        
        // Track mouse movement for parallax effect
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            // Apply subtle parallax movement to star layers
            document.querySelectorAll('.star-layer-1').forEach(star => {
                star.style.transform = `translate(${mouseX * 5}px, ${mouseY * 5}px)`;
            });
            
            document.querySelectorAll('.star-layer-2').forEach(star => {
                star.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
            });
        });
        
        // Periodically create shooting stars with varying intensity
        setInterval(() => {
            // Occasionally create multiple shooting stars for meteor shower effect
            const count = Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 1;
            for (let i = 0; i < count; i++) {
                setTimeout(() => createShootingStar(), i * 200);
            }
        }, shootingStarInterval);
        
        // Create nebula effect with improved colors
        createNebula();
        
        // Add occasional twinkle burst effect
        setInterval(() => {
            if (Math.random() > 0.7) {
                createTwinkleBurst();
            }
        }, 8000);
    }

    function createStar(layer = 0) {
        const starfield = document.getElementById('starfield');
        const star = document.createElement('div');
        star.className = `star star-layer-${layer}`;
        
        // Random star properties with improved distribution
        const sizeBase = Math.random();
        // Use exponential distribution for more realistic star sizes (mostly small with few larger ones)
        const size = sizeBase * sizeBase * 3.5; 
        const opacity = Math.random() * 0.7 + 0.3;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Vary twinkle animation durations by layer for more natural look
        const durationBase = 5 + (layer * 2);
        const duration = Math.random() * 10 + durationBase;
        
        // Set star styles
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = opacity;
        star.style.left = `${posX}%`;
        star.style.top = `${posY}%`;
        star.style.animationDuration = `${duration}s`;
        
        // Add slight delay to animation start for more natural look
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        // Add a glow to larger stars with more realistic intensity
        if (size > 1.8) {
            const glowIntensity = Math.min(opacity * 1.2, 1.0);
            const glowSize = size * (2 + Math.random());
            star.style.boxShadow = `0 0 ${glowSize}px rgba(255, 255, 255, ${glowIntensity})`;
        }
        
        // Add subtle color tint to some stars
        if (Math.random() > 0.85) {
            const hue = Math.random() > 0.5 ? 
                Math.floor(Math.random() * 30) : // Warm colors (reddish)
                Math.floor(Math.random() * 30) + 200; // Cool colors (bluish)
            star.style.backgroundColor = `hsl(${hue}, 100%, 90%)`;
        }
        
        starfield.appendChild(star);
    }

    function createShootingStar() {
        const starfield = document.getElementById('starfield');
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Improved position and angle for shooting star
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * (window.innerHeight / 3); // Start from top third of screen
        const angle = Math.random() * 60 - 30; // Random angle between -30 and 30 degrees
        const duration = Math.random() * 1.5 + 0.8; // Faster, more dynamic duration (0.8-2.3s)
        
        // Set shooting star styles
        shootingStar.style.left = `${posX}px`;
        shootingStar.style.top = `${posY}px`;
        shootingStar.style.transform = `rotate(${angle}deg)`;
        shootingStar.style.animationDuration = `${duration}s`;
        
        // Randomize shooting star trail length and brightness
        const length = 80 + Math.random() * 40;
        const brightness = 0.7 + Math.random() * 0.3;
        shootingStar.style.height = `${length}px`;
        shootingStar.style.opacity = brightness;
        
        starfield.appendChild(shootingStar);
        
        // Add particles effect when shooting star "burns up"
        setTimeout(() => {
            createShootingStarParticles(posX, posY, angle);
            shootingStar.remove();
        }, duration * 1000);
    }

    function createShootingStarParticles(x, y, angle) {
        // Only create particles if they would be visible (shooting star doesn't go off-screen too quickly)
        if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return;
        
        // Calculate end position based on angle and animation
        const radians = (angle - 90) * (Math.PI / 180);
        const distance = Math.min(window.innerWidth, window.innerHeight) * 0.2;
        const endX = x + Math.cos(radians) * distance;
        const endY = y + Math.sin(radians) * distance;
        
        // Create particle explosion
        const starfield = document.getElementById('starfield');
        const particleCount = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'star-particle';
            
            // Set particle styles
            particle.style.left = `${endX}px`;
            particle.style.top = `${endY}px`;
            particle.style.width = `${Math.random() * 2 + 1}px`;
            particle.style.height = `${Math.random() * 2 + 1}px`;
            
            // Set random particle animation
            const particleAngle = Math.random() * 360;
            const particleDistance = Math.random() * 30 + 10;
            const translateX = Math.cos(particleAngle * (Math.PI / 180)) * particleDistance;
            const translateY = Math.sin(particleAngle * (Math.PI / 180)) * particleDistance;
            
            // Set CSS variables for the animation
            particle.style.setProperty('--tx', `${translateX}px`);
            particle.style.setProperty('--ty', `${translateY}px`);
            
            particle.style.animation = `particle-fade ${Math.random() * 0.5 + 0.5}s ease-out forwards`;
            
            starfield.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    function createTwinkleBurst() {
        const starfield = document.getElementById('starfield');
        const burstCenter = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };
        
        // Create multiple stars in a burst pattern
        const burstSize = Math.floor(Math.random() * 8) + 5;
        const burstRadius = Math.random() * 100 + 50;
        
        for (let i = 0; i < burstSize; i++) {
            const angle = (i / burstSize) * Math.PI * 2;
            const distance = Math.random() * burstRadius;
            
            const x = burstCenter.x + Math.cos(angle) * distance;
            const y = burstCenter.y + Math.sin(angle) * distance;
            
            // Calculate position as percentage
            const posX = (x / window.innerWidth) * 100;
            const posY = (y / window.innerHeight) * 100;
            
            // Create a special twinkling star
            const star = document.createElement('div');
            star.className = 'star twinkle-burst';
            
            // Make burst stars slightly larger and brighter
            const size = Math.random() * 2.5 + 1;
            
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${posX}%`;
            star.style.top = `${posY}%`;
            star.style.opacity = 0;
            star.style.boxShadow = `0 0 ${size * 3}px rgba(255, 255, 255, 0.9)`;
            
            // Add special animation for burst stars
            star.style.animation = 'burstTwinkle 3s ease-in-out forwards';
            
            starfield.appendChild(star);
            
            // Remove burst stars after animation
            setTimeout(() => {
                star.remove();
            }, 3000);
        }
    }

    function createNebula() {
        const starfield = document.getElementById('starfield');
        const nebula = document.createElement('div');
        nebula.className = 'nebula';
        
        // Create more color layers for richer nebula
        const colorLayers = [
            { color: 'rgba(255, 138, 0, 0.04)', size: 1 },  // Orange
            { color: 'rgba(183, 33, 255, 0.025)', size: 1.2 }, // Purple
            { color: 'rgba(255, 94, 98, 0.03)', size: 0.9 },  // Pink
            { color: 'rgba(36, 135, 255, 0.02)', size: 1.3 }  // Blue
        ];
        
        // Create multiple color layers for nebula
        colorLayers.forEach(layer => {
            const nebulaLayer = document.createElement('div');
            nebulaLayer.className = 'nebula-layer';
            
            // Randomize nebula properties
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const baseSize = Math.random() * 30 + 20;
            const size = baseSize * layer.size;
            const duration = Math.random() * 100 + 100;
            
            // Set nebula styles with improved gradient
            nebulaLayer.style.background = `radial-gradient(circle at center, ${layer.color} 0%, transparent 75%)`;
            nebulaLayer.style.left = `${posX}%`;
            nebulaLayer.style.top = `${posY}%`;
            nebulaLayer.style.width = `${size}%`;
            nebulaLayer.style.height = `${size}%`;
            nebulaLayer.style.animationDuration = `${duration}s`;
            nebulaLayer.style.animationDelay = `${Math.random() * 10}s`;
            
            nebula.appendChild(nebulaLayer);
        });
        
        starfield.appendChild(nebula);
    }
    
    // Chat functionality
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    // Max chat history limit
    const MAX_CHAT_HISTORY = 50;

    // Add subtle hover effect to messages
    function addHoverEffects() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.addEventListener('mouseover', () => {
                message.style.transition = 'transform 0.3s ease';
                if (message.classList.contains('user-message')) {
                    message.style.transform = 'translateX(-5px)';
                } else {
                    message.style.transform = 'translateX(5px)';
                }
            });
            
            message.addEventListener('mouseout', () => {
                message.style.transform = 'translateX(0)';
            });
        });
    }

    // Add button animation
    if (sendButton) {
        sendButton.addEventListener('mousedown', () => {
            sendButton.style.transform = 'scale(0.95)';
        });
        
        sendButton.addEventListener('mouseup', () => {
            sendButton.style.transform = 'scale(1.05) rotate(5deg)';
            setTimeout(() => {
                sendButton.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Enhanced error handling
    function sendMessage() {
        if (!userInput) return;
        
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator with a slight delay for realism
        if (typingIndicator) {
            setTimeout(() => {
                typingIndicator.style.display = 'flex';
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 300);
        }
        
        // Set timeout for API response
        let timeoutId = setTimeout(() => {
            if (typingIndicator) typingIndicator.style.display = 'none';
            addMessage('Sorry, it seems the server is taking too long to respond. Please try again later.', 'bot');
        }, 30000); // 30 seconds timeout
        
        // Send request to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            if (typingIndicator) typingIndicator.style.display = 'none';
            
            // Add bot response to chat
            addMessage(data.response, 'bot');
            
            // Check if we should exit
            if (data.exit) {
                setTimeout(() => {
                    if (userInput) userInput.disabled = true;
                    if (sendButton) sendButton.disabled = true;
                    
                    // Close the window after 2 seconds
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                }, 1000);
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            if (typingIndicator) typingIndicator.style.display = 'none';
            console.error('Error:', error);
            addMessage('Sorry, there was an error processing your request. Please try again.', 'bot');
        })
        .finally(() => {
            // Ensure typing indicator is hidden in all cases
            if (typingIndicator) typingIndicator.style.display = 'none';
        });
    }
    
    function addMessage(text, sender) {
        const chatBox = document.getElementById('chat-box');
        const messageDiv = document.createElement('div');
        
        // Ensure typing indicator is hidden when adding a message
        document.getElementById('typing-indicator').style.display = 'none';
        
        // Add slide-in animation class based on sender
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
        
        // Add animation style with random delay for natural feel
        const randomDelay = Math.random() * 0.3;
        messageDiv.style.animationDelay = `${randomDelay}s`;
        
        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = sender === 'user' ? 'You' : 'Culture Guide';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add timestamp to messages
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        const now = new Date();
        timestampDiv.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Add action buttons for bot messages
        if (sender === 'bot') {
            const actionButtons = document.createElement('div');
            actionButtons.className = 'message-actions';
            
            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button copy-button';
            copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/></svg>';
            copyButton.setAttribute('aria-label', 'Copy message');
            copyButton.title = 'Copy to clipboard';
            
            // Share button 
            const shareButton = document.createElement('button');
            shareButton.className = 'action-button share-button';
            shareButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/></svg>';
            shareButton.setAttribute('aria-label', 'Share message');
            shareButton.title = 'Share this information';
            
            // Add event listeners
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const textToCopy = contentDiv.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show copy confirmation
                    const tooltip = document.createElement('div');
                    tooltip.className = 'copy-tooltip';
                    tooltip.textContent = 'Copied!';
                    copyButton.appendChild(tooltip);
                    setTimeout(() => tooltip.remove(), 1500);
                });
            });
            
            shareButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Implement native share API if available
                if (navigator.share) {
                    navigator.share({
                        title: 'Cultural Information',
                        text: contentDiv.textContent,
                    })
                    .catch(err => console.error('Share failed:', err));
                } else {
                    // Fallback - copy to clipboard
                    navigator.clipboard.writeText(contentDiv.textContent);
                    const tooltip = document.createElement('div');
                    tooltip.className = 'copy-tooltip';
                    tooltip.textContent = 'Copied for sharing!';
                    shareButton.appendChild(tooltip);
                    setTimeout(() => tooltip.remove(), 1500);
                }
            });
            
            actionButtons.appendChild(copyButton);
            actionButtons.appendChild(shareButton);
            messageDiv.appendChild(actionButtons);
        }
        
        // Apply appropriate sizing based on content length
        const textLength = text.length;
        
        // For user messages, position on right with appropriate width
        if (sender === 'user') {
            // Responsive width calculation with increased minimums
            contentDiv.style.textAlign = 'right';
            // Removed fixed width calculation to let CSS handle responsive sizing
        } else {
            // For bot messages, position on left
            contentDiv.style.textAlign = 'left';
            // Removed fixed width calculation to let CSS handle responsive sizing
        }
        
        // If bot message, add typewriter effect
        if(sender === 'bot') {
            // Mark this as a loading message
            messageDiv.classList.add('loading');
            
            // Add a progress bar for visual feedback
            const progressBar = document.createElement('div');
            progressBar.className = 'response-progress';
            
            // Initial empty content
            contentDiv.textContent = '';
            
            // Append message structure first
            messageDiv.appendChild(senderDiv);
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(progressBar);
            messageDiv.appendChild(timestampDiv);
            chatBox.appendChild(messageDiv);
            
            // Scroll to new message
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Process text and replace literal HTML tags
            let processedText = text;
            
            // Keep HTML tags intact instead of converting them to entities
            // We're intentionally receiving formatted HTML from the server
            
            let i = 0;
            const totalLength = processedText.length;
            const baseSpeed = 15; // Base ms per character (faster)
            let currentDelay = baseSpeed;
            
            // Create a list of keywords to highlight/pause at
            const highlightWords = ['culture', 'tradition', 'history', 'important', 'celebration', 'festival', 
                                   'cuisine', 'landmark', 'religion', 'art', 'music', 'dance', 'language'];
            
            function typeWriter() {
                if (i < processedText.length) {
                    // Update progress bar
                    progressBar.style.width = `${(i / totalLength) * 100}%`;
                    
                    // Check if we're at the start of an HTML tag
                    if (processedText.charAt(i) === '<') {
                        // Find the end of the tag
                        const tagEnd = processedText.indexOf('>', i);
                        if (tagEnd !== -1) {
                            // Add the entire tag at once
                            contentDiv.innerHTML += processedText.substring(i, tagEnd + 1);
                            i = tagEnd + 1;
                            
                            // No need to recalculate size after HTML tag - let CSS handle responsive sizing
                            
                            // Continue at normal speed
                            currentDelay = baseSpeed;
                        } else {
                            // Just in case there's a malformed tag
                            contentDiv.innerHTML += '&lt;';
                            i++;
                        }
                    } else {
                        // Check if the next few characters match any highlight words
                        let shouldHighlight = false;
                        let wordToCheck = '';
                        let matchedWord = '';
                        
                        // Check for the start of a new word
                        if (i === 0 || /\s/.test(processedText.charAt(i-1))) {
                            // Look ahead to find a word
                            for (let j = 0; j < 12 && i+j < processedText.length; j++) {
                                if (/\s/.test(processedText.charAt(i+j))) {
                                    wordToCheck = processedText.substring(i, i+j).toLowerCase();
                                    break;
                                }
                                if (j === 11) {
                                    wordToCheck = processedText.substring(i, i+12).toLowerCase();
                                }
                            }
                            
                            // See if it's in our highlight list
                            highlightWords.forEach(word => {
                                if (wordToCheck.indexOf(word) === 0 || wordToCheck === word) {
                                    shouldHighlight = true;
                                    matchedWord = word;
                                }
                            });
                        }
                        
                        // Add dynamic pauses and speeds
                        if (processedText.charAt(i) === '.' || 
                            processedText.charAt(i) === '!' || 
                            processedText.charAt(i) === '?') {
                            // Pause longer at the end of sentences
                            currentDelay = baseSpeed * 6;
                            
                            // Create subtle twinkle animation at punctuation
                            createTwinkleBurst();
                        } else if (processedText.charAt(i) === ',' || processedText.charAt(i) === ';') {
                            // Slight pause at commas and semicolons
                            currentDelay = baseSpeed * 3;
                        } else if (shouldHighlight) {
                            // Highlight important words by slowing down slightly
                            currentDelay = baseSpeed * 1.5;
                        } else {
                            // Return to normal speed
                            currentDelay = baseSpeed;
                        }
                        
                        // Add normal characters one by one
                        contentDiv.innerHTML += processedText.charAt(i);
                        i++;
                    }
                    
                    chatBox.scrollTop = chatBox.scrollHeight;
                    setTimeout(typeWriter, currentDelay);
                } else {
                    // We've finished typing
                    // Remove loading class and progress bar
                    messageDiv.classList.remove('loading');
                    progressBar.style.width = '100%';
                    
                    // Add completed class for animation
                    messageDiv.classList.add('message-complete');
                    
                    // Remove progress bar after completion animation
                    setTimeout(() => {
                        progressBar.remove();
                    }, 500);
                    
                    // Format interesting facts with a special class
                    const strongElements = contentDiv.querySelectorAll('strong');
                    strongElements.forEach(el => {
                        if (el.textContent.includes('Interesting Fact') || 
                            el.textContent.includes('Interesting fact')) {
                            el.classList.add('interesting-fact');
                        }
                    });
                    
                    // Add collapsible sections for long lists if they exist
                    const ulElements = contentDiv.querySelectorAll('ul');
                    if (ulElements.length > 0 && ulElements[0].children.length > 5) {
                        ulElements.forEach(ul => {
                            if (ul.children.length > 5) {
                                // Create show more/less toggle
                                const showMoreButton = document.createElement('button');
                                showMoreButton.className = 'show-more-button';
                                showMoreButton.textContent = 'Show more';
                                
                                // Hide items beyond the 5th
                                for (let i = 5; i < ul.children.length; i++) {
                                    ul.children[i].classList.add('hidden-item');
                                }
                                
                                // Add toggle functionality
                                showMoreButton.addEventListener('click', () => {
                                    const hiddenItems = ul.querySelectorAll('.hidden-item');
                                    if (showMoreButton.textContent === 'Show more') {
                                        hiddenItems.forEach(item => item.classList.remove('hidden-item'));
                                        showMoreButton.textContent = 'Show less';
                                    } else {
                                        for (let i = 5; i < ul.children.length; i++) {
                                            ul.children[i].classList.add('hidden-item');
                                        }
                                        showMoreButton.textContent = 'Show more';
                                    }
                                });
                                
                                // Add button after the list
                                ul.parentNode.insertBefore(showMoreButton, ul.nextSibling);
                            }
                        });
                    }
                    
                    // Final resize of the content bubble based on complete text
                    const finalTextLength = contentDiv.textContent.length;
                    const finalContentWidth = Math.min(Math.max(finalTextLength * 6, 120), 400);
                    contentDiv.style.maxWidth = `${finalContentWidth}px`;
                    
                    // Ensure typing indicator is always hidden when animation completes
                    typingIndicator.style.display = 'none';
                    
                    chatBox.scrollTop = chatBox.scrollHeight;
                    
                    // Add a subtle animation to indicate the message is complete
                    contentDiv.classList.add('message-complete');
                }
            }
            
            typeWriter();
        } else {
            // User messages appear instantly
            contentDiv.textContent = text;
            messageDiv.appendChild(senderDiv);
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timestampDiv);
            chatBox.appendChild(messageDiv);
            
            // Scroll to new message
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
        // Add subtle hover effect to all messages
        addHoverEffects();
    }
    
    // Add keyboard support for better accessibility
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            sendMessage();
            e.preventDefault();
        }
    });

    // Add welcome message hints after 5 seconds
    setTimeout(() => {
        if (document.querySelectorAll('.message').length <= 1) {
            addMessage('Try asking me about traditional foods in Japan, wedding customs in India, or festivals in Mexico!', 'bot');
        }
    }, 5000);

    // Initialize
    userInput.focus();
    addHoverEffects();
    sendButton.addEventListener('click', sendMessage);

    // Connect export and clear chat buttons
    document.getElementById('export-chat-btn').addEventListener('click', exportChat);
    document.getElementById('clear-chat-btn').addEventListener('click', clearChat);

    function scrollToBottom(smooth = true) {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.scrollTo({
                top: chatBox.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }

    // Add keyboard shortcut for sending messages
    document.addEventListener('keydown', function(e) {
        const userInput = document.getElementById('user-input');
        
        // If Ctrl/Cmd+Enter is pressed and user input is focused
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement === userInput) {
            e.preventDefault();
            sendMessage();
        }
        
        // Add Escape key to close open panels
        if (e.key === 'Escape') {
            // Hide any open panels or pickers
            document.querySelectorAll('.accessibility-panel').forEach(panel => {
                panel.classList.remove('visible');
                panel.classList.remove('active');
            });
            
            // Remove active states from buttons
            document.querySelectorAll('.accessibility-button').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    });

    // Setup floating action button
    function setupFloatingActionButton() {
        // ... existing code ...
    }

    // Setup modals
    function setupModals() {
        const privacyLink = document.getElementById('privacy-link');
        const aboutLink = document.getElementById('about-link');
        const privacyModal = document.getElementById('privacy-modal');
        const aboutModal = document.getElementById('about-modal');
        const closeButtons = document.querySelectorAll('.modal-close');

        // Set up event listeners for the export and clear chat buttons
        document.getElementById('export-chat-btn').addEventListener('click', exportChat);
        document.getElementById('clear-chat-btn').addEventListener('click', clearChat);
        
        // Open privacy modal
        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(privacyModal);
        });
        
        // Open about modal
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(aboutModal);
        });
        
        // Close button functionality
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Close modal when clicking outside content
        document.addEventListener('click', function(e) {
            const modals = document.querySelectorAll('.modal.visible');
            modals.forEach(modal => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.visible');
                modals.forEach(modal => {
                    closeModal(modal);
                });
            }
        });
    }
    
    // Helper to open modal
    function openModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
    
    // Helper to close modal
    function closeModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            // Restore body scrolling
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Toast notification functionality
    function showToast(message, duration = 3000) {
        const toast = document.getElementById('notification-toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    function exportChat() {
        // Get all messages
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            const sender = msg.classList.contains('user-message') ? 'You' : 'Culture Guide';
            const text = msg.querySelector('.message-content').textContent;
            messages.push(`${sender}: ${text}`);
        });
        
        // Format as readable text
        const dateStr = new Date().toLocaleString();
        const textContent = `Culture Guide Chat - ${dateStr}\n\n${messages.join('\n\n')}`;
        
        // Create a blob and download link
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `culture-guide-chat-${new Date().toISOString().split('T')[0]}.txt`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showToast('Chat exported as text file');
    }
    
    function clearChat() {
        // Show confirmation dialog
        if (confirm('Are you sure you want to clear the entire chat history?')) {
            // Clear chat box
            document.getElementById('chat-box').innerHTML = '';
            
            // Add welcome message back
            addWelcomeMessage();
            
            showToast('Chat history cleared');
        }
    }
}); 