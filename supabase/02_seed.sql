-- ===========================================================================
--  SEED DATA
--  Run AFTER 01_schema.sql. Safe to re-run — it clears and re-inserts.
--
--  Everything below is editable from the admin dashboard afterwards. Fields
--  marked "TODO" are placeholders: information that was not supplied, left
--  deliberately blank rather than invented. Search this file for "TODO" to
--  see everything you should fill in from /admin.
-- ===========================================================================

-- --- Profile (About) -------------------------------------------------------
delete from public.profiles;
insert into public.profiles (
  full_name, headline, intro, biography, location, email,
  linkedin_url, github_url, writing_url, status
) values (
  'Priyanshu Jaiswal',
  'PGDM | Finance & Analytics | Writer',
  'I''m a PGDM student specializing in Finance with a minor in Analytics, with professional experience across accounting, claims operations, and sales & marketing. I''m interested in using financial thinking, data, and storytelling to solve business problems.',
  'I''m a PGDM student at Great Lakes Institute of Management, Gurgaon, majoring in Finance with a minor in Analytics, after a B.Com (Hons.) from the University of Lucknow.

My work so far has been split between the ledger and the dashboard. At Accenture I worked in accounts payable, processing invoices at volume and chasing down the data gaps that made month-end harder than it needed to be. At Genpact I handled US client claims and the compliance reporting around them. Both taught me the same thing: most financial problems are really data problems wearing a suit.

Alongside that, I write. I published my first novel, "Love Across the Stars," on Amazon Kindle in 2023, and I''ve been writing fiction and essays for several years. It''s not a side note to the finance work — it''s where I learned to build an argument, hold an audience, and make a complicated thing land in one clear sentence. That turns out to be most of what a good analyst does.

TODO: replace or extend this biography from the admin dashboard.',
  'TODO: your city, India',
  'TODO: your.email@example.com',
  'TODO: https://www.linkedin.com/in/your-handle',
  'TODO: https://github.com/your-handle',
  null,
  'published'
);

-- --- Site settings ---------------------------------------------------------
delete from public.site_settings;
insert into public.site_settings (
  site_title, site_description, canonical_url, contact_email, contact_note, footer_note
) values (
  'Priyanshu Jaiswal | Finance & Analytics',
  'PGDM student specialising in Finance with a minor in Analytics. Financial modelling, valuation, Power BI and Python work — and a writer''s portfolio alongside it.',
  'TODO: https://yourdomain.com',
  'TODO: your.email@example.com',
  'The fastest way to reach me is email. I read everything and reply to most things.',
  'Built and maintained by Priyanshu Jaiswal.'
);

-- --- Experience ------------------------------------------------------------
delete from public.experiences;
insert into public.experiences
  (company, job_title, location, start_date, end_date, is_current, description, bullets, skills, display_order, status)
values
  ('Accenture', 'Accounts Associate', 'TODO: location',
   '2025-03-01', '2025-06-30', false,
   'Accounts payable operations within a large-scale finance delivery team.',
   array[
     'Processed 200+ invoices per day using Oracle AP.',
     'Identified accounting data gaps and coordinated resolution through email communication.',
     'Created team reports to improve management visibility and support consulting deliverables.'
   ],
   array['Oracle AP','Accounts Payable','Reconciliation','Reporting','Stakeholder Communication'],
   1, 'published'),

  ('Genpact', 'Process Associate / Apprentice', 'TODO: location',
   '2025-01-01', '2025-02-28', false,
   'Claims operations and compliance reporting for US healthcare clients.',
   array[
     'Processed and verified 40+ US client claims per day.',
     'Supported claims payment processes.',
     'Prepared compliance-related reports.'
   ],
   array['Claims Processing','Compliance Reporting','Data Verification','Process Documentation'],
   2, 'published'),

  ('INME Summer Camps', 'Sales & Marketing Intern', 'TODO: location',
   null, null, false,
   'TODO: add a one-line description of this role.',
   array[
     'TODO: add your first bullet point for this role.'
   ],
   array['Sales','Marketing','Client Outreach'],
   3, 'published');

-- --- Education -------------------------------------------------------------
delete from public.education;
insert into public.education
  (institution, degree, major, minor, start_year, end_year, grade, description, display_order, status)
values
  ('Great Lakes Institute of Management, Gurgaon', 'PGDM', 'Finance', 'Analytics',
   null, null, 'TODO: CGPA',
   'TODO: add coursework, electives or activities worth highlighting.', 1, 'published'),
  ('University of Lucknow', 'B.Com (Hons.)', null, null,
   null, null, 'TODO: percentage / CGPA',
   'TODO: add anything worth highlighting from your undergraduate degree.', 2, 'published');

-- --- Projects: FINANCE -----------------------------------------------------
delete from public.projects;
insert into public.projects
  (kind, title, slug, category, short_description, description, tools, skills, is_featured, display_order, status)
values
  ('finance', 'Financial Modelling', 'financial-modelling', 'Modelling',
   'A three-statement operating model built from the ground up, linking income statement, balance sheet and cash flow.',
   'TODO: describe the company or scenario modelled, the assumptions you drove the model on, and what the output told you. Attach the Excel file and a PDF summary using the file fields.',
   array['Excel'], array['Financial Modelling','Forecasting','Three-Statement Modelling'],
   true, 1, 'published'),

  ('finance', 'Company Valuation / DCF', 'company-valuation-dcf', 'Valuation',
   'Discounted cash flow valuation with a WACC build-up, terminal value and sensitivity analysis.',
   'TODO: name the company valued, state the intrinsic value you arrived at versus the market price, and explain the two or three assumptions the valuation is most sensitive to.',
   array['Excel'], array['DCF','WACC','Valuation','Sensitivity Analysis'],
   true, 2, 'published'),

  ('finance', 'Working Capital Analysis', 'working-capital-analysis', 'Corporate Finance',
   'Cash conversion cycle and working capital efficiency analysis across a set of comparable firms.',
   'TODO: describe the firms or industry analysed, the cycle metrics you computed, and the operational recommendation the numbers supported.',
   array['Excel'], array['Working Capital','Cash Conversion Cycle','Ratio Analysis'],
   false, 3, 'published'),

  ('finance', 'Banking Financial Statement Analysis', 'banking-financial-statement-analysis', 'Banking',
   'Analysis of a bank''s financials — asset quality, capital adequacy and margin structure.',
   'TODO: name the bank, list the ratios examined (NIM, GNPA/NNPA, CAR, CASA), and summarise your read on its health.',
   array['Excel'], array['Financial Statement Analysis','Banking Analysis','Ratio Analysis'],
   false, 4, 'published');

-- --- Projects: ANALYTICS ---------------------------------------------------
insert into public.projects
  (kind, title, slug, category, short_description, description, tools, skills, is_featured, display_order, status)
values
  ('analytics', 'Power BI Banking Dashboard', 'power-bi-banking-dashboard', 'Power BI',
   'An interactive dashboard tracking a bank''s portfolio health, deposits and lending mix.',
   'TODO: describe the dataset, the measures you wrote in DAX, and the decision the dashboard was designed to support. Upload screenshots using the images field.',
   array['Power BI','DAX','Excel'], array['Power BI','Data Modelling','Dashboard Design'],
   true, 1, 'published'),

  ('analytics', 'Loan Default Prediction', 'loan-default-prediction', 'Machine Learning',
   'A classification model predicting borrower default from application and bureau features.',
   'TODO: state the dataset, the models compared, the metric you optimised for (and why recall probably mattered more than accuracy here), and the final performance.',
   array['Python','scikit-learn','pandas'], array['Machine Learning','Classification','Feature Engineering'],
   true, 2, 'published'),

  ('analytics', 'Sales Analytics Dashboard', 'sales-analytics-dashboard', 'Business Analytics',
   'Revenue, regional performance and product-mix reporting built for a sales team.',
   'TODO: describe the business question, the data sources, and what changed as a result of the dashboard.',
   array['Power BI','Excel','SQL'], array['Business Analytics','Reporting','SQL'],
   false, 3, 'published'),

  ('analytics', 'EDA / Predictive Analytics Project', 'eda-predictive-analytics', 'Python',
   'Exploratory data analysis leading into a predictive model.',
   'TODO: describe the dataset, what the exploratory phase revealed, and how that shaped the model you built.',
   array['Python','pandas','matplotlib'], array['EDA','Regression','Statistics'],
   false, 4, 'published');

-- --- Projects: GENERAL ("Things I've Built") -------------------------------
insert into public.projects
  (kind, title, slug, category, short_description, problem, solution, features, technology, role, is_featured, display_order, status)
values
  ('general', 'Spotly', 'spotly', 'Product',
   'A restaurant discovery and recommendation platform.',
   'TODO: what problem does Spotly solve? Who felt it, and how badly?',
   'TODO: how does Spotly solve it? One paragraph.',
   array['TODO: feature one','TODO: feature two','TODO: feature three'],
   array['TODO: stack'],
   'TODO: your role on this project',
   true, 1, 'published'),

  ('general', 'Finnlyy', 'finnlyy', 'FinTech',
   'A FinTech salary-advance product concept and prototype.',
   'TODO: what problem does Finnlyy address for salaried workers?',
   'TODO: how does the product work, and what is the business model?',
   array['TODO: feature one','TODO: feature two','TODO: feature three'],
   array['TODO: stack'],
   'TODO: your role on this project',
   true, 2, 'published'),

  ('general', 'Devil''s Witness', 'devils-witness', 'Blockchain',
   'A blockchain-based evidence integrity concept.',
   'TODO: what integrity problem does this address, and for whom?',
   'TODO: how does the chain-of-custody design work?',
   array['TODO: feature one','TODO: feature two','TODO: feature three'],
   array['TODO: stack'],
   'TODO: your role on this project',
   false, 3, 'draft');

-- --- Writing ---------------------------------------------------------------
delete from public.writing;
insert into public.writing
  (title, slug, writing_type, description, published_on, tags, is_featured, display_order, status)
values
  ('Love Across the Stars', 'love-across-the-stars', 'book',
   'My first novel, published on Amazon Kindle in 2023. TODO: add a short synopsis, and paste your Kindle link into the External URL field.',
   '2023-01-01', array['novel','fiction','romance'], true, 1, 'published'),
  ('TODO: your first essay or article', 'first-essay', 'essay',
   'TODO: add a description, then either paste the full text into the Content field or link out.',
   null, array['essay'], false, 2, 'draft'),
  ('TODO: a poem', 'a-poem', 'poem',
   'TODO: paste the poem into the Content field. It will render on the public site.',
   null, array['poetry'], false, 3, 'draft');

-- --- Achievements ----------------------------------------------------------
delete from public.achievements;
insert into public.achievements
  (title, organization, awarded_on, description, display_order, status)
values
  ('Aditya Birla Group Scholarship', 'Aditya Birla Group', null,
   'Awarded a scholarship of ₹4 lakh. TODO: add the year and a line on the selection process.',
   1, 'published');

-- --- Skills ----------------------------------------------------------------
delete from public.skills;
delete from public.skill_categories;

with cats as (
  insert into public.skill_categories (name, display_order, status) values
    ('Finance', 1, 'published'),
    ('Analytics', 2, 'published'),
    ('Business', 3, 'published'),
    ('Technology', 4, 'published'),
    ('Creative', 5, 'published')
  returning id, name
)
insert into public.skills (category_id, name, display_order, status)
select c.id, s.name, s.ord, 'published'
from cats c
join (values
  ('Finance','Financial Modelling',1),
  ('Finance','Valuation',2),
  ('Finance','DCF',3),
  ('Finance','WACC',4),
  ('Finance','Working Capital',5),
  ('Finance','Financial Statement Analysis',6),
  ('Finance','Banking Analysis',7),
  ('Analytics','Excel',1),
  ('Analytics','Power BI',2),
  ('Analytics','Python',3),
  ('Analytics','SQL',4),
  ('Analytics','EDA',5),
  ('Analytics','Regression',6),
  ('Analytics','Classification',7),
  ('Business','Accounts Payable',1),
  ('Business','Claims Operations',2),
  ('Business','Compliance Reporting',3),
  ('Business','Sales & Marketing',4),
  ('Technology','Oracle AP',1),
  ('Technology','Microsoft Excel',2),
  ('Technology','pandas',3),
  ('Creative','Fiction Writing',1),
  ('Creative','Long-form Essays',2),
  ('Creative','Storytelling',3),
  ('Creative','Editing',4)
) as s(cat, name, ord) on s.cat = c.name;

-- --- Social links ----------------------------------------------------------
delete from public.social_links;
insert into public.social_links (label, url, icon, display_order, status) values
  ('LinkedIn', 'TODO: https://www.linkedin.com/in/your-handle', 'linkedin', 1, 'published'),
  ('GitHub',   'TODO: https://github.com/your-handle',          'github',   2, 'published'),
  ('Email',    'mailto:TODO-your.email@example.com',            'email',    3, 'published');

-- --- Resume ----------------------------------------------------------------
-- Intentionally empty. Upload your PDF from /admin/resume and mark it active;
-- the public "Download Resume" buttons hide themselves until you do.
delete from public.resumes;

-- ===========================================================================
--  Done. Next: 03_create_admin.sql.
-- ===========================================================================
