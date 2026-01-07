from django.core.management.base import BaseCommand
from knowledge.models import KBArticle


class Command(BaseCommand):
    help = 'Flood the Knowledge Base with sample articles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Number of articles to create (default: 50)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        articles_data = [
            # HR Articles
            {
                'title': 'How to Request Annual Leave',
                'content': '''To request annual leave, follow these steps:

1. Log into the HR Portal at hr.company.com
2. Navigate to "Leave Management" section
3. Click "Request Leave"
4. Select leave type: Annual, Sick, or Personal
5. Choose start and end dates
6. Add reason (optional but recommended)
7. Submit for manager approval

**Important Notes:**
- Request leave at least 2 weeks in advance for annual leave
- Emergency sick leave can be requested same-day
- Maximum consecutive leave: 15 days
- Check your leave balance before requesting

**Approval Process:**
- Manager reviews within 48 hours
- HR confirms once approved
- You'll receive email notification

For questions, contact HR at hr@company.com or extension 1234.''',
                'category': 1,
                'is_published': True
            },
            {
                'title': 'Payroll and Salary Slip Access',
                'content': '''Access your payroll information through the Employee Self-Service Portal.

**How to View Salary Slip:**
1. Login to ESS Portal: ess.company.com
2. Go to "Payroll" section
3. Select month and year
4. Download PDF salary slip

**Salary Components:**
- Basic Salary
- House Rent Allowance (HRA)
- Conveyance Allowance
- Medical Allowance
- Professional Tax deduction
- Provident Fund contribution

**Salary Credit Schedule:**
- Last working day of each month
- If weekend/holiday: previous working day
- Delays: Contact payroll@company.com

**Tax Documents:**
- Form 16 available in April each year
- Investment declarations due by December
- Reimbursement claims within 30 days

For payroll queries: payroll@company.com or Ext: 1245''',
                'category': 1,
                'is_published': True
            },
            {
                'title': 'Employee Benefits and Perks',
                'content': '''Our comprehensive benefits package includes:

**Health Insurance:**
- Medical coverage for employee + family
- Cashless treatment at 5000+ hospitals
- Annual health checkup included
- Coverage: Up to 5 lakhs per year

**Other Benefits:**
- Provident Fund (PF) - 12% contribution
- Gratuity after 5 years of service
- Group Life Insurance
- Accident Insurance

**Perks:**
- Flexible work hours
- Work from home options (2 days/week)
- Free lunch and snacks
- Gym membership reimbursement
- Learning and development budget

**Leave Benefits:**
- 24 days annual leave
- 12 days sick leave
- 10 public holidays
- Maternity: 26 weeks, Paternity: 2 weeks

Enroll during onboarding or contact HR for changes.''',
                'category': 1,
                'is_published': True
            },
            {
                'title': 'Performance Review Process',
                'content': '''Annual performance reviews happen twice a year.

**Review Cycle:**
- Mid-year review: June-July
- Annual review: December-January

**Process:**
1. Self-assessment submission
2. Manager evaluation
3. One-on-one review meeting
4. Goal setting for next period
5. Rating finalization

**Rating Scale:**
- 5: Exceptional (Top 5%)
- 4: Exceeds expectations
- 3: Meets expectations
- 2: Needs improvement
- 1: Unsatisfactory

**Components Evaluated:**
- Job knowledge and skills
- Quality of work
- Productivity and efficiency
- Communication skills
- Teamwork and collaboration
- Innovation and problem-solving

**Promotion Criteria:**
- Consistent rating of 4 or above
- Minimum 2 years in current role
- Demonstrated leadership potential

Results impact annual increments and bonuses.''',
                'category': 1,
                'is_published': True
            },
            
            # IT Articles
            {
                'title': 'Reset Your Password',
                'content': '''Forgot your password? Here's how to reset it:

**Self-Service Reset:**
1. Go to login.company.com
2. Click "Forgot Password"
3. Enter your employee ID or email
4. Verify with OTP sent to registered mobile
5. Create new password

**Password Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)
- Cannot reuse last 5 passwords

**If Self-Service Fails:**
Contact IT Support:
- Email: itsupport@company.com
- Phone: +91-XXX-XXX-XXXX (Mon-Fri, 9 AM - 6 PM)
- Internal Extension: 1234
- Response Time: High (System outage) - 4 hours

**Security Tips:**
- Never share passwords
- Change password every 90 days
- Don't write passwords down
- Use password manager if needed

For account lockouts after 3 failed attempts, contact IT immediately.''',
                'category': 2,
                'is_published': True
            },
            {
                'title': 'VPN Setup and Remote Access',
                'content': '''Access company resources securely from home.

**Download VPN Client:**
1. Visit vpn.company.com
2. Download for Windows/Mac/Linux
3. Install with admin rights
4. Restart computer

**Configuration:**
- VPN Server: vpn.company.com
- Authentication: Use your domain credentials
- Two-factor: Receive OTP on registered mobile

**Connect to VPN:**
1. Open VPN client
2. Enter username (firstname.lastname)
3. Enter password
4. Enter OTP from SMS
5. Click "Connect"

**What You Can Access:**
- Internal applications
- File servers and shared drives
- Email and collaboration tools
- Development environments

**Troubleshooting:**
- Check internet connection first
- Ensure firewall allows VPN
- Update VPN client to latest version
- Clear cache and retry

**Security:**
- VPN auto-disconnects after 12 hours
- Don't use on public WiFi without VPN
- Log out when done

Support: itsupport@company.com''',
                'category': 2,
                'is_published': True
            },
            {
                'title': 'Software Installation Request',
                'content': '''Need new software? Here's the approval process:

**Pre-Approved Software:**
Can be installed via Self-Service Portal:
- Microsoft Office Suite
- Adobe Acrobat Reader
- Zoom, MS Teams
- Chrome, Firefox browsers
- 7-Zip, WinRAR
- Visual Studio Code (for developers)

**Self-Service Installation:**
1. Open Software Center on your PC
2. Browse available software
3. Click "Install"
4. Wait for completion
5. Restart if prompted

**Custom Software Request:**
For specialized tools:
1. Submit ticket at helpdesk.company.com
2. Provide software name and version
3. Business justification required
4. Include license details if applicable

**Approval Process:**
- Manager approval needed
- IT security review
- License procurement (if needed)
- Installation scheduled
- Turnaround: 3-5 business days

**Prohibited Software:**
- Unauthorized cloud storage
- P2P file sharing apps
- Personal VPNs
- Cryptocurrency miners

For open-source software, security review mandatory.''',
                'category': 2,
                'is_published': True
            },
            {
                'title': 'Email and Outlook Issues',
                'content': '''Troubleshoot common email problems.

**Cannot Send/Receive Emails:**
1. Check internet connection
2. Verify Outlook is online (bottom right status)
3. Check mailbox quota (File > Info)
4. Restart Outlook
5. Clear cache: File > Options > Advanced > Outlook Data File Settings

**Large Mailbox Issues:**
- Archive old emails (over 1 year)
- Empty Deleted Items folder
- Reduce sent items retention
- Current limit: 50 GB

**Email Best Practices:**
- Don't Reply All unless necessary
- Use meaningful subject lines
- Attachments under 25 MB (use file share for large files)
- Set Out of Office when on leave
- Use folders and rules to organize

**Configure Out of Office:**
1. File > Automatic Replies
2. Enable "Send automatic replies"
3. Set date range
4. Write inside/outside organization messages
5. Click OK

**Distribution Lists:**
To request new distribution list:
- Submit ticket with list name
- Provide members' names
- Specify list owner
- Approval from department head

**Spam/Phishing:**
- Never click suspicious links
- Report phishing: Forward to security@company.com
- Don't share personal/login info via email

Support: itsupport@company.com | Ext: 1234''',
                'category': 2,
                'is_published': True
            },
            {
                'title': 'Wi-Fi and Network Connectivity',
                'content': '''Connect to office Wi-Fi and troubleshoot network issues.

**Office Wi-Fi Networks:**
- CompanyName-Corporate: For employees
- CompanyName-Guest: For visitors
- CompanyName-IoT: For smart devices

**Connect to Corporate Wi-Fi:**
1. Select "CompanyName-Corporate"
2. Enter your domain credentials
3. Username: firstname.lastname
4. Password: Your Windows login password
5. Auto-connects after first setup

**Wi-Fi Troubleshooting:**
**Slow Connection:**
- Move closer to access point
- Disconnect unused devices
- Check for updates
- Restart Wi-Fi adapter

**Cannot Connect:**
- Forget network and reconnect
- Update network drivers
- Disable/enable Wi-Fi
- Check if account is active

**Guest Wi-Fi:**
For visitors:
- Request guest access from IT
- Valid for 24 hours
- Speed limited for security
- Cannot access internal resources

**Ethernet Connection:**
Better for:
- Large file transfers
- Video conferencing
- Development work
- Stable connection needed

**Network Drives:**
- H: Drive - Home folder
- S: Drive - Shared department folder
- P: Drive - Project files

Map drives: \\fileserver\share

**Speed Test:**
Expected speeds:
- Wi-Fi: 100-300 Mbps
- Ethernet: 1 Gbps

If slower, contact IT.

**Network Issues:**
Submit ticket at helpdesk.company.com
Priority: High if affecting work
Response: Within 4 hours''',
                'category': 2,
                'is_published': True
            },
            
            # Facilities Articles
            {
                'title': 'Meeting Room Booking',
                'content': '''Book conference rooms for meetings and events.

**Available Rooms:**
- Small: 2-6 people (10 rooms)
- Medium: 6-12 people (5 rooms)
- Large: 12-20 people (3 rooms)
- Auditorium: 50+ people (1 room)

**Facilities in Rooms:**
- LED Display/Projector
- Video conferencing equipment
- Whiteboard and markers
- High-speed Wi-Fi
- Conference phone

**Booking Process:**
1. Open Outlook Calendar
2. Create new meeting
3. Click "Room Finder"
4. Select building and capacity
5. Choose available room
6. Add to meeting

**Online Booking:**
Via portal: rooms.company.com
1. Login with credentials
2. Select date and time
3. Choose room by capacity
4. Add meeting details
5. Confirm booking

**Booking Rules:**
- Max advance booking: 30 days
- Minimum duration: 30 minutes
- Auto-cancellation if not checked-in after 15 mins
- Max consecutive booking: 4 hours

**Catering Services:**
For meetings with food:
- Book 24 hours in advance
- Email catering@company.com
- Specify: Date, time, count, preferences
- Budget codes required

**Room Setup:**
Available arrangements:
- Theater style
- Classroom style
- U-shape
- Boardroom

Request setup 24 hours prior.

**Cancellation:**
Cancel bookings you don't need.
No-show 3 times = booking privileges suspended.

Facilities: facilities@company.com | Ext: 5678''',
                'category': 3,
                'is_published': True
            },
            {
                'title': 'Parking and Transportation',
                'content': '''Information about parking facilities and transportation.

**Parking Allocation:**
- Basement parking: Senior management
- Ground floor: First-come-first-served
- Overflow parking: Adjacent lot (5 min walk)
- Total spots: 200
- Peak hours: 9-10 AM arrival

**Parking Permit:**
Apply via facilities portal:
1. Submit vehicle details
2. Upload RC copy
3. Provide driving license
4. Get approval (3 working days)
5. Collect parking sticker

**Rules:**
- Display parking permit visibly
- Park only in designated areas
- Speed limit: 10 kmph inside premises
- No parking in fire lanes
- Lost permit replacement: ₹500

**Visitor Parking:**
- Register at security gate
- Temporary pass issued
- Valid for same day only
- Park in designated visitor area

**Two-Wheeler Parking:**
- Dedicated area near entrance
- Helmet mandatory
- Free of charge
- Security surveillance 24/7

**Company Transport:**
Routes available:
- Route A: Eastern suburbs
- Route B: Western suburbs
- Route C: South zone
- Route D: North zone

**Transport Schedule:**
Morning:
- Pickup starts: 7:30 AM
- Reaches office by: 9:00 AM

Evening:
- Departures: 6:00 PM, 7:00 PM, 8:00 PM

**Opt-in for Transport:**
Email: transport@company.com
- Mention route and pickup point
- Advance notice: 5 days
- Monthly pass: ₹2,000

**Cab Reimbursement:**
For late working (post 9 PM):
- Submit expense claim
- Attach cab receipt
- Max limit: ₹800 per trip
- Approval from manager needed

Contact: facilities@company.com''',
                'category': 3,
                'is_published': True
            },
            {
                'title': 'Cafeteria Services and Meal Policy',
                'content': '''Information about cafeteria services and meal benefits.

**Cafeteria Timings:**
- Breakfast: 8:00 AM - 10:00 AM
- Lunch: 12:00 PM - 2:30 PM
- Snacks: 4:00 PM - 5:30 PM
- Dinner (for late workers): 7:00 PM - 9:00 PM

**Meal Subsidy:**
Company provides:
- Free breakfast (tea/coffee + snacks)
- Subsidized lunch (₹50 employee contribution)
- Free evening snacks
- Free dinner if working post 7 PM

**Payment:**
- Swipe employee ID card
- Balance auto-deducted from salary
- Monthly statement via email
- Top-up: Not required (auto-adjusted)

**Menu:**
- North and South Indian options
- Salad bar
- Beverages station
- Weekly special: Friday international cuisine
- Vegan/Jain options available

**Dietary Requirements:**
For special dietary needs:
- Inform cafeteria manager
- Email: cafeteria@company.com
- Allergies/restrictions accommodated
- Halal/Jain food available

**Hygiene and Quality:**
- FSSAI certified
- Daily health inspection
- Feedback system via app
- Monthly menu review

**Outside Food:**
- Allowed in designated areas only
- Not allowed in work areas
- Pantry available for heating
- Refrigerator space limited

**Vending Machines:**
- Located on each floor
- Coffee/tea/snacks available 24/7
- Cashless payment only
- Free for employees

**Birthday/Event Catering:**
For team celebrations:
- Contact cafeteria 48 hours prior
- Customized menu available
- Cost split among team
- Cake orders: Min 1 kg

**Feedback:**
Rate meals via: feedback.company.com
Monthly surveys to improve service.

Contact: cafeteria@company.com''',
                'category': 3,
                'is_published': True
            },
            {
                'title': 'Office Maintenance Requests',
                'content': '''Report and track maintenance issues in office.

**Common Issues:**
- AC not working
- Lighting problems
- Furniture repair
- Plumbing issues
- Electrical faults
- Pest control

**Report Issue:**
**Method 1: Online Portal**
1. Visit: helpdesk.company.com
2. Select "Facilities"
3. Choose issue type
4. Add location details
5. Upload photo if helpful
6. Submit ticket

**Method 2: Email**
Email: facilities@company.com
Include:
- Location (Floor, wing, desk number)
- Issue description
- Urgency level
- Your contact info

**Method 3: Phone**
Call: Ext 5678 or +91-XXX-XXX-XXXX
Available: 24/7 for emergencies

**Priority Levels:**
**Emergency (Immediate):**
- Fire/safety hazards
- Water leakage
- Power outage
- AC failure in server room
Response: Within 30 minutes

**High (Same day):**
- AC issues
- Broken furniture
- Non-functional lights
Response: Within 4 hours

**Medium (Next day):**
- Minor repairs
- Painting requests
- Blinds adjustment
Response: Within 24 hours

**Low (Scheduled):**
- Aesthetic improvements
- Non-urgent requests
Response: Within 3 days

**Track Your Request:**
- Via portal: Check ticket status
- Email updates sent automatically
- SMS for status changes
- Closure confirmation required

**Preventive Maintenance:**
Scheduled activities:
- AC servicing: Monthly
- Fire safety check: Weekly
- Pest control: Fortnightly
- Deep cleaning: Quarterly

**Workspace Relocation:**
For desk/cabin change requests:
- Approval from manager
- Submit 1 week in advance
- IT will move equipment
- Facilities will arrange furniture

**Equipment Requests:**
For new furniture/equipment:
- Chair, desk, cabinet
- Monitor stand
- Footrest
- Request via portal
- Manager approval needed

Feedback: facilities@company.com''',
                'category': 3,
                'is_published': True
            },
            
            # General Articles
            {
                'title': 'New Employee Onboarding Guide',
                'content': '''Welcome to the company! Here's your complete onboarding guide.

**Before Your First Day:**
- Documentation email sent
- Complete background verification
- Submit required documents
- Confirm joining date

**Day 1 Checklist:**
**Morning (9 AM):**
- Report to reception
- Collect temporary badge
- Meet HR team
- Complete formalities

**Document Submission:**
- PAN card copy
- Aadhaar card copy
- Education certificates
- Previous employer relieving letter
- Bank account details
- 2 passport photos

**IT Setup:**
- Collect laptop and accessories
- Username and temporary password
- Email account activation
- VPN setup
- Software installations
- Phone/headset (if applicable)

**First Week:**
**Orientation Sessions:**
- Company introduction (Day 1)
- Department overview (Day 2)
- Policies and procedures (Day 3)
- Systems training (Day 4)
- Team introductions (Day 5)

**Manager Meeting:**
- Discuss role expectations
- Review job description
- Set 30-60-90 day goals
- Understand team structure
- Schedule regular 1-on-1s

**Week 2 Onwards:**
- Shadow senior team members
- Start on assigned tasks
- Attend team meetings
- Complete mandatory e-learning
- Mid-probation review (Month 3)

**Probation Period:**
- Duration: 6 months
- Monthly reviews with manager
- Final confirmation in Month 6
- Extensions rare but possible

**Benefits Enrollment:**
- Health insurance nomination
- PF account setup
- Gratuity enrollment
- Meal card activation
- Transport pass (if applicable)

**Buddy Program:**
- Assigned a buddy from team
- Go-to person for questions
- Lunch companion
- Cultural integration help

**Important Contacts:**
- HR: hr@company.com | Ext 1234
- IT: itsupport@company.com | Ext 1234
- Facilities: facilities@company.com | Ext 5678
- Manager: [Provided separately]

**Company Policies:**
Read in employee handbook:
- Code of conduct
- Leave policy
- Work hours and flexibility
- Dress code
- Information security
- Anti-harassment policy

Welcome aboard! 🎉''',
                'category': 4,
                'is_published': True
            },
            {
                'title': 'Company Policies and Code of Conduct',
                'content': '''Essential policies every employee should know.

**Work Hours:**
- Core hours: 10 AM - 4 PM (mandatory)
- Flexible hours: 9 AM - 7 PM
- Total: 9 hours/day including lunch
- Weekly: 45 hours

**Flexible Work:**
- Work from home: 2 days/week (post probation)
- Advance approval from manager
- Must be available during core hours
- Proper internet and workspace required

**Dress Code:**
**Regular Days:**
- Business casual
- Formal is not mandatory
- Avoid: Torn jeans, shorts, flip-flops
- Acceptable: Jeans, t-shirts, sneakers

**Client Meetings/Important Events:**
- Business formal required
- Prior notice given by manager

**Leave Policy:**
- Annual leave: 24 days
- Sick leave: 12 days
- Casual leave: Included in annual
- Public holidays: 10 days
- Carry forward: Max 5 days

**Leave Application:**
- Apply at least 2 weeks advance
- Emergency: Manager approval
- Half-days allowed
- Leave without pay for excess

**Attendance:**
- Biometric/card swipe mandatory
- Grace period: 15 minutes
- Late arrival (3x/month): Warning
- Time tracking for projects

**Communication:**
- Official: Company email only
- Personal email: Not for work
- WhatsApp groups: Department specific
- Confidential info: Encrypted only

**Information Security:**
- Don't share passwords
- Lock computer when away
- No unauthorized software
- Company data: Don't copy to personal devices
- Lost device: Report immediately

**Confidentiality:**
- NDA signed during onboarding
- Client information: Highly confidential
- Proprietary code/documents: Restricted
- Penalties for breach: Termination + legal

**Workplace Conduct:**
- Respect all colleagues
- Zero tolerance for harassment
- No discrimination
- No workplace violence
- Substance abuse: Prohibited

**Whistleblower Policy:**
Report violations anonymously:
- Email: ethics@company.com
- Hotline: 1800-XXX-XXXX
- Identity protected
- No retaliation

**Social Media:**
- Personal opinions are your own
- Don't represent company without authorization
- No confidential info sharing
- No disparaging comments about company

**Conflict of Interest:**
Declare if you:
- Have business interests elsewhere
- Hire relatives
- Work with competitors
- Accept gifts from vendors

**Disciplinary Action:**
Progressive discipline:
- Verbal warning
- Written warning
- Suspension
- Termination

For serious violations: Immediate termination.

Questions: hr@company.com''',
                'category': 4,
                'is_published': True
            },
            {
                'title': 'Emergency Procedures and Safety',
                'content': '''Safety procedures and emergency protocols.

**Fire Emergency:**
**If You Discover Fire:**
1. Activate nearest fire alarm
2. Call security: Ext 9999
3. Don't use elevators
4. Exit via nearest stairwell
5. Help others if safe to do so

**Evacuation:**
- Follow illuminated exit signs
- Use stairs only, never elevators
- Don't stop to collect belongings
- Assist persons with disabilities
- Assembly point: Front parking lot
- Wait for headcount

**Fire Extinguishers:**
- Located every 30 meters
- Red boxes clearly marked
- PASS method: Pull, Aim, Squeeze, Sweep
- Use only if fire is small
- Don't fight large fires

**Medical Emergency:**
**On-Site Medical Room:**
- Location: Ground floor, near cafeteria
- Nurse available: 9 AM - 6 PM
- First aid kits on every floor
- AED (Defibrillator) available

**For Medical Emergency:**
1. Call security: Ext 9999
2. Call nurse: Ext 7777
3. Don't move injured person
4. Provide first aid if trained
5. Call ambulance if serious

**Hospital Tie-ups:**
- XYZ Hospital: 5 min away
- ABC Clinic: 3 min away
- Ambulance: 108
- Company doctor: On-call 24/7

**Earthquake:**
**During Earthquake:**
- Drop, Cover, Hold On
- Get under desk/table
- Stay away from windows
- Don't use elevators
- Protect head and neck

**After Shaking Stops:**
- Evacuate calmly
- Use stairs only
- Check for injuries
- Report to assembly point

**Bomb Threat:**
- Stay calm
- Note caller details if phone threat
- Don't touch suspicious items
- Evacuate immediately
- Call police: 100
- Call security: Ext 9999

**Active Threat:**
If someone with weapon enters:
- **Run:** Escape if possible
- **Hide:** Lock/barricade yourself
- **Fight:** Last resort only
- Call police: 100
- Call security: Ext 9999

**Weather Emergency:**
**Flood/Heavy Rain:**
- Stay indoors if possible
- Avoid basement parking
- Don't drive through waterlogged areas
- Company transport arranged if needed

**Cyclone/Storm:**
- Move away from windows
- Stay in interior rooms
- Emergency supplies available
- Updates via SMS/email

**Power Outage:**
- Emergency lights auto-activate
- DG backup for critical areas
- Don't use elevators
- Stay at desk until power restored
- IT systems protected by UPS

**Elevator Breakdown:**
If stuck in elevator:
- Press alarm button
- Call: Ext 9999
- Don't try to escape
- Help will arrive in 10-15 min

**Security Contacts:**
- Main desk: Ext 9999
- Security manager: Ext 8888
- Emergency: 100 (Police), 108 (Ambulance)

**Safety Training:**
- Mandatory for all employees
- Fire drill: Quarterly
- First aid training: Annual
- CPR certification: Voluntary

**Safety Committee:**
- Meets monthly
- Employee representatives
- Safety inspections
- Incident investigations

**Report Hazards:**
Don't ignore safety issues:
- Email: safety@company.com
- Anonymous reporting ok
- Corrective action taken
- No retaliation for reporting

Stay safe! 🛡️''',
                'category': 4,
                'is_published': True
            },
            {
                'title': 'Learning and Development Opportunities',
                'content': '''Grow your skills with company learning programs.

**Learning Budget:**
Each employee receives:
- ₹50,000 annual learning budget
- For courses, certifications, conferences
- Manager approval required
- Use it or lose it (no carry forward)

**Online Learning Platforms:**
Company subscriptions:
- LinkedIn Learning
- Udemy Business
- Coursera for Business
- Pluralsight
- O'Reilly Learning

**Access:**
1. Visit lms.company.com
2. Login with credentials
3. Browse course catalog
4. Enroll in courses
5. Complete at your pace

**Certification Support:**
Company pays for:
- Professional certifications (PMP, AWS, etc.)
- Exam fees
- Preparation materials
- Exam retake (once)

**Application Process:**
1. Discuss with manager
2. Submit request via LMS
3. HR approval
4. Schedule exam
5. Company books and pays

**Popular Certifications:**
- AWS Certified Solutions Architect
- Google Cloud Professional
- PMP (Project Management)
- SHRM-CP (HR)
- CFA, FRM (Finance)
- Six Sigma certifications

**Internal Training:**
**Mandatory Training:**
- Information security (Annual)
- Harassment prevention (Annual)
- Compliance training (Quarterly)
- Safety procedures (Annual)

**Technical Training:**
- New technology workshops
- Lunch and learn sessions
- Hackathons
- Tech talks by experts

**Soft Skills:**
- Communication skills
- Leadership development
- Time management
- Presentation skills
- Negotiation techniques

**Career Development:**
**Mentorship Program:**
- Senior leaders as mentors
- Career guidance
- Skill development
- Networking opportunities
- Apply via: mentorship@company.com

**Leadership Program:**
For high-potential employees:
- 6-month intensive program
- Executive coaching
- Cross-functional projects
- Presentation to leadership

**Conferences and Events:**
Company sponsors:
- Industry conferences
- Technical symposiums
- Networking events
- Professional meet-ups

**Application:**
- Submit 1 month in advance
- Manager recommendation
- Limit: 2 conferences/year
- Company covers: Travel, accommodation, registration

**Job Rotation:**
Explore different roles:
- 3-6 month rotations
- Cross-department moves
- Same grade, different function
- Broaden experience
- Manager approval needed

**Internal Job Postings:**
- Posted on intranet weekly
- Current employees apply first
- Interviews within company
- Notice period: 2 weeks for internal transfer

**Knowledge Sharing:**
**Brown Bag Sessions:**
- Informal learning lunches
- Employees share expertise
- Every Friday 1-2 PM
- Volunteer to present

**Tech Blog:**
Contribute articles:
- blog.company.com
- Share learnings
- Build personal brand
- Reviewed by editors

**Quarterly Awards:**
Recognition for learning:
- Most courses completed
- Certification achieved
- Knowledge shared
- Prizes and certificates

**Academic Programs:**
**MBA/Masters Support:**
For higher education:
- Financial assistance available
- Study leave provisions
- Flexible hours
- Bond period: 2 years post-completion

**Eligibility:**
- 2+ years with company
- Good performance rating
- Manager recommendation
- Part-time programs preferred

Contact: learning@company.com | Ext 3456

Invest in yourself! 📚''',
                'category': 4,
                'is_published': True
            },
        ]
        
        self.stdout.write(self.style.WARNING(f'Creating {count} articles...'))
        
        created_count = 0
        for i in range(count):
            # Cycle through the sample articles
            article_data = articles_data[i % len(articles_data)].copy()
            
            # Add number suffix to make titles unique
            if i >= len(articles_data):
                article_data['title'] = f"{article_data['title']} (Version {i // len(articles_data) + 1})"
            
            article = KBArticle.objects.create(**article_data)
            created_count += 1
            
            if created_count % 10 == 0:
                self.stdout.write(f'Created {created_count}/{count} articles...')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {created_count} KB articles!'))
        self.stdout.write(self.style.SUCCESS('Now rebuild the RAG index from admin panel or run:'))
        self.stdout.write(self.style.WARNING('  curl -X POST http://localhost:8000/api/kb/kb-rebuild-index/'))
