import io, sys
R = []  # (file, line prefix, new line)
def fix(f, prefix, new): R.append((f, prefix, new))

# ---- test 1
fix('test1', 'The siren of an approaching ambulance appears to rise in pitch.',
 'The siren of an approaching ambulance sounds higher in pitch than its actual pitch. This is due to the: ||| Doppler effect ||| Reverberation ||| Resonance ||| Beats ||| A ||| The relative motion of source and listener changes the apparent frequency.')
fix('test1', 'The objective "the pupil can draw a labelled diagram',
 'The objective "the pupil sets up the apparatus to study the image formed by a convex lens" belongs to the: ||| Cognitive domain ||| Affective domain ||| Psychomotor domain ||| Social domain ||| C ||| Setting up and handling apparatus is a manipulative skill, so it is psychomotor.')
fix('test1', 'Children with an IQ above 130 are usually classified as:',
 'Children with an IQ above about 130 are usually classified as: ||| Slow learners ||| Gifted ||| Backward ||| Educable mentally retarded ||| B ||| An IQ above about 130 is the usual cut-off for giftedness.')
fix('test1', 'Two miscible liquids with different boiling points are separated by:',
 'Oil and water, which do not mix, can be separated using a: ||| Separating funnel ||| Filter paper ||| Sublimation apparatus ||| Chromatography paper ||| A ||| The denser liquid is run off through the tap of a separating funnel.')
fix('test1', 'താഴെ പറയുന്നവയിൽ ആജ്ഞാർഥ വാക്യം ഏത്?',
 'താഴെ പറയുന്നവയിൽ ആജ്ഞാർഥ വാക്യം ഏത്? ||| നീ പുസ്തകം വായിക്കുന്നു ||| അവൻ പുസ്തകം വായിച്ചു ||| നീ പുസ്തകം വായിക്കുക ||| അവൻ പുസ്തകം വായിക്കും ||| C ||| ഒരു കാര്യം ചെയ്യാൻ കൽപ്പിക്കുന്ന വാക്യമാണ് ആജ്ഞാർഥം.')
fix('test1', '‘കണ്ണിൽ എണ്ണയൊഴിച്ച് കാത്തിരിക്കുക’',
 '‘കണ്ണിൽ എണ്ണയൊഴിച്ച് കാത്തിരിക്കുക’ എന്ന ശൈലിയുടെ അർഥം ഏത്? ||| കണ്ണിന് ചികിത്സ ചെയ്യുക ||| ഉറക്കമിളച്ച് ജാഗ്രതയോടെ കാത്തിരിക്കുക ||| എണ്ണ വാങ്ങാൻ കാത്തിരിക്കുക ||| ദുഃഖിച്ചിരിക്കുക ||| B ||| അതീവ ശ്രദ്ധയോടെയും ഉറക്കമൊഴിച്ചും കാത്തിരിക്കുക എന്നാണ് ഇതിന്റെ അർഥം.')

# ---- test 2
fix('test2', 'An adolescent who starts thumb-sucking again',
 'A 15-year-old who sulks and throws tantrums like a small child whenever he is under stress shows the defence mechanism of: ||| Regression ||| Sublimation ||| Compensation ||| Projection ||| A ||| Regression is a return to behaviour typical of an earlier stage under stress.')
fix('test2', 'Under the RTE Act 2009, no child can be held back',
 'As originally enacted, the RTE Act 2009 provided that no child could be held back or expelled until the completion of: ||| Primary education ||| Elementary education ||| Secondary education ||| Higher secondary education ||| B ||| The original no-detention provision ran to the end of elementary education. The 2019 amendment lets states hold children back in some classes, but expulsion remains barred.')
fix('test2', 'The advance organiser model of teaching is associated with:',
 'The Biological Science Inquiry Model of teaching is associated with: ||| Joseph Schwab ||| Richard Suchman ||| David Ausubel ||| Jerome Bruner ||| A ||| Schwab designed this model to teach students the methods of scientific inquiry.')
fix('test2', '‘കുട്ടി’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്?',
 '‘കുട്ടി’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്? ||| കുട്ടിങ്ങൾ ||| കുട്ടികൾ ||| കുട്ടിമാർ ||| കുട്ടിയർ ||| B ||| ‘-കൾ’ പ്രത്യയം ചേർത്ത് ബഹുവചനം ഉണ്ടാക്കുന്നു.')
fix('test2', 'വരികൾ വായിച്ച് ഉത്തരം തിരഞ്ഞെടുക്കുക: “കാലം കഴിഞ്ഞാൽ',
 'വരികൾ വായിച്ച് ഉത്തരം തിരഞ്ഞെടുക്കുക: “കാലം കഴിഞ്ഞാൽ തിരികെ വരില്ല, കർമം ചെയ്യുക സമയത്ത്.” ഈ വരികൾ നൽകുന്ന സന്ദേശം എന്താണ്? ||| കാലം തിരിച്ചുവരും ||| ജോലി സമയത്തുതന്നെ ചെയ്യണം ||| കർമം ചെയ്യരുത് ||| കാത്തിരിക്കുന്നതാണ് നല്ലത് ||| B ||| പോയ കാലം തിരികെ വരില്ല, അതിനാൽ കർമം സമയത്ത് ചെയ്യണമെന്നാണ് സന്ദേശം.')

# ---- test 3
fix('test3', 'Which of the following phenomena are involved in the formation of a rainbow?',
 'Which of the following phenomena are involved in the formation of a rainbow? ||| Dispersion, refraction and internal reflection ||| Only reflection ||| Only diffraction ||| Polarisation ||| A ||| Sunlight is refracted and dispersed on entering a water drop, reflected inside it, and refracted again on leaving.')
fix('test3', 'A charged rod is brought near, but does not touch',
 'A charged rod is brought near, but does not touch, an isolated metal sphere. While the rod is still near, the sphere is earthed, the earth connection is then removed, and finally the rod is taken away. The sphere becomes charged by: ||| Conduction ||| Induction ||| Friction ||| Radiation ||| B ||| Charging without contact, using earthing, is charging by induction.')
fix('test3', 'One mole of any gas at STP occupies a volume of:',
 'One mole of any gas at STP (273 K, 1 atm) occupies a volume of: ||| 2.24 L ||| 11.2 L ||| 22.4 L ||| 44.8 L ||| C ||| The molar volume of a gas at 273 K and 1 atm is 22.4 L.')
fix('test3', "Kurt Lewin's field theory explains behaviour",
 "Kurt Lewin's field theory explains behaviour as a function of the person and the: ||| Heredity ||| Psychological environment ||| Intelligence quotient ||| Age ||| B ||| Behaviour is a function of the person and the environment, B = f(P, E); together they form the life space.")
fix('test3', "Which of the following best describes a good teacher's role in a learner-centred classroom?",
 "A teacher who influences pupils by setting an example through his own conduct and values acts as a: ||| Source of all knowledge ||| Role model ||| Strict punisher ||| Passive observer ||| B ||| Pupils learn values by observing the teacher's behaviour.")
fix('test3', 'The constructivist approach differs from the behaviourist approach',
 'The scientific process approach to teaching science emphasises: ||| Learning by using the processes scientists use, such as observing, hypothesising and experimenting ||| Memorising laws ||| Copying notes ||| Listening only ||| A ||| Pupils learn science by practising the processes of science.')
fix('test3', 'വരികൾ വായിച്ച് ഉത്തരം തിരഞ്ഞെടുക്കുക: “ഒരു തൈ നടാം',
 'വരികൾ വായിച്ച് ഉത്തരം തിരഞ്ഞെടുക്കുക: “ഒരു തൈ നടാം നമുക്കിന്ന്, നാളെയതൊരു തണലായ് നിൽക്കും.” ഈ വരികൾ പ്രോത്സാഹിപ്പിക്കുന്നത് എന്താണ്? ||| മരം മുറിക്കൽ ||| മരം നടൽ ||| വീടുപണി ||| യാത്ര ||| B ||| ഇന്ന് തൈ നട്ടാൽ നാളെ അത് തണൽ നൽകും എന്ന് വരികൾ പറയുന്നു.')
fix('test3', '‘അധ്യാപകൻ’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ഏത്?',
 '‘അധ്യാപകൻ’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ഏത്? ||| അധ്യാപിക ||| അധ്യാപകി ||| അധ്യാപൻ ||| അധ്യാപക ||| A ||| ‘അധ്യാപകൻ’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ‘അധ്യാപിക’.')

# ---- test 4
fix('test4', 'Methane is the first member of the homologous series of:',
 'Which of the following is an unsaturated hydrocarbon? ||| Ethane ||| Ethene ||| Methane ||| Propane ||| B ||| Ethene (C₂H₄) has a carbon-carbon double bond; the others have only single bonds.')
fix('test4', 'Which gas is mainly responsible for the greenhouse effect?',
 'Which of these gases is the main contributor to the enhanced greenhouse effect (global warming) caused by human activity? ||| Oxygen ||| Carbon dioxide ||| Nitrogen ||| Argon ||| B ||| Carbon dioxide released by burning fuels traps extra heat in the atmosphere.')
fix('test4', 'According to the Yerkes-Dodson principle',
 'According to the Yerkes-Dodson principle, performance is best when arousal (anxiety) is: ||| Absent ||| Moderate ||| Very high ||| Extremely low ||| B ||| A moderate level of arousal improves performance.')
fix('test4', 'Which of the following supports lifelong professional growth',
 "Observing one another's classes and giving feedback helps teachers by: ||| Sharing good practice and improving their teaching ||| Wasting class time ||| Lowering standards ||| Avoiding reflection ||| A ||| Peer observation is a practical way to learn from colleagues.")
fix('test4', '‘എഴുതുന്നു’ എന്ന വർത്തമാനകാല ക്രിയയുടെ',
 '‘കവി’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ഏത്? ||| കവയിത്രി ||| കവിനി ||| കവിക ||| കവിയാൾ ||| A ||| ‘കവി’യുടെ സ്ത്രീലിംഗം ‘കവയിത്രി’.')
fix('test4', '‘കുഞ്ഞ്’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്?',
 '‘കുഞ്ഞ്’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്? ||| കുഞ്ഞുകൾ ||| കുഞ്ഞുങ്ങൾ ||| കുഞ്ഞന്മാർ ||| കുഞ്ഞർ ||| B ||| ‘കുഞ്ഞ്’ എന്ന പദത്തിന്റെ ബഹുവചനം ‘കുഞ്ഞുങ്ങൾ’.')

# ---- test 5
fix('test5', 'Article 21A of the Constitution of India provides for:',
 'Article 21A, the right to education, was inserted into the Constitution by the: ||| 86th Amendment ||| 42nd Amendment ||| 44th Amendment ||| 73rd Amendment ||| A ||| The 86th Amendment of 2002 inserted Article 21A.')
fix('test5', 'The molecular formula of ethane is:',
 'The functional group present in alcohols is: ||| -OH ||| -COOH ||| -CHO ||| -NH₂ ||| A ||| Alcohols contain the hydroxyl (-OH) group.')
fix('test5', '‘വരുക’ എന്ന ക്രിയയുടെ ഭൂതകാലരൂപം ഏത്?',
 '‘രാജാവ്’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ഏത്? ||| രാജ്ഞി ||| രാജി ||| രാജിക ||| രാജ്യ ||| A ||| ‘രാജാവ്’ എന്ന പദത്തിന്റെ സ്ത്രീലിംഗം ‘രാജ്ഞി’ ആണ്.')
fix('test5', '‘പുസ്തകം’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്?',
 '‘പുസ്തകം’ എന്ന പദത്തിന്റെ ബഹുവചനം ഏത്? ||| പുസ്തകങ്ങൾ ||| പുസ്തകർ ||| പുസ്തകമാർ ||| പുസ്തകികൾ ||| A ||| ‘പുസ്തകം’ എന്ന പദത്തിന്റെ ബഹുവചനം ‘പുസ്തകങ്ങൾ’.')
fix('test5', 'മലയാളത്തിലെ ചില്ലക്ഷരങ്ങളുടെ എണ്ണം',
 'മലയാളത്തിൽ സാധാരണയായി പഠിപ്പിക്കുന്ന ചില്ലക്ഷരങ്ങൾ എത്ര? ||| 3 ||| 4 ||| 5 ||| 7 ||| C ||| ണ്‍, ന്‍, ര്‍, ല്‍, ള്‍ എന്നിങ്ങനെ അഞ്ച് ചില്ലക്ഷരങ്ങളാണ് സാധാരണ പഠിപ്പിക്കുന്നത്; ൿ എന്ന ആറാമത്തെ ചില്ല വളരെ അപൂർവമായേ ഉപയോഗിക്കുന്നുള്ളൂ.')

files = {}
bad = 0
for f, prefix, new in R:
    p = f'bank-src/{f}.txt'
    if p not in files:
        files[p] = io.open(p, encoding='utf-8', newline='').read().split('\n')
    lines = files[p]
    hits = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    if len(hits) != 1:
        print('PROBLEM', f, repr(prefix[:40]), 'matches', len(hits)); bad += 1; continue
    lines[hits[0]] = new
if bad:
    sys.exit(1)
for p, lines in files.items():
    io.open(p, 'w', encoding='utf-8', newline='').write('\n'.join(lines))
print('applied', len(R))
