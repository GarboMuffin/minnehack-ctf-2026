import { Category, staticFlag } from "../challenges.js";
import { highlight, ssh } from "./shared.js";

const c = new Category({
    name: 'Cryptography',
    description: ``
});

c.add({
    id: 'caesar',
    name: 'Caesar',
    value: 25,
    description: () => `
        <p>Decrypt this:</p>
        <pre>yetz{VhgynlxHktgzxHuebztmbhgItktwxTulxgmLnkikblx}</pre>
    `,
    check: staticFlag('flag{ConfuseOrangeObligationParadeAbsentSurprise}')
});

/*
From Wikipedia, the free encyclopedia
Bowling Alone: The Collapse and Revival of American Community is a 2000 nonfiction book by Robert D. Putnam. It was developed from his 1995 essay entitled "Bowling Alone: America's Declining Social Capital" in the Journal of Democracy. Putnam surveys the decline of social capital in the United States since 1950. He has described the reduction in all the forms of in-person social intercourse upon which Americans used to found, educate, and enrich the fabric of their social lives. He argues that this undermines the active civic engagement which a strong democracy requires from its citizens.
Putnam discussed ways in which Americans disengaged from community involvement, including decreased voter turnout, attendance at public meetings, service on committees, and work with political parties. Putnam also cited Americans' growing distrust in their government. Putnam accepted the possibility that this lack of trust could be attributed to "the long litany of political tragedies and scandals since the 1960s", but believed that this explanation was limited when viewing it alongside other "trends in civic engagement of a wider sort".
Putnam noted the aggregate loss in membership and number of volunteers in many existing civic organizations such as religious groups (Knights of Columbus, B'nai Brith, etc.), labor unions, parent–teacher associations, Federation of Women's Clubs, League of Women Voters, military veterans' organizations, volunteers with Boy Scouts and the Red Cross, and fraternal organizations (Lions Clubs, Benevolent and Protective Order of Elks, United States Junior Chamber, Freemasonry, Rotary, Kiwanis, etc.). Putnam used bowling as an example to illustrate this; although the number of people who bowled had increased in the last 20 years, the number of people who bowled in leagues had decreased. If people bowled alone, they did not participate in the social interaction and civic discussions that might occur in a league environment.
Putnam cites data from the General Social Survey that showed an aggregate decline in membership of traditional civic organizations, supporting his thesis that U.S. social capital had declined. He noted that some organizations had grown, such as the American Association of Retired Persons, the Sierra Club, and a plethora of mass-member activist groups. But he said that these groups did not tend to foster face-to-face interaction, and were the type where "the only act of membership consists in writing a check for dues or perhaps occasionally reading a newsletter." He also drew a distinction between two different types of social capital: a "bonding" type (which occurs within a demographic group) and a "bridging" type (which unites people from different groups).
He then asked: "Why is US social capital eroding?" and discussed several possible causes. He believed that the "movement of women into the workforce" and other demographic changes affected the number of individuals engaging in civic associations. He also discussed the "re-potting hypothesis"—that people become less engaged when they frequently move towns—but found that Americans actually moved towns less frequently than in previous decades. He did suggest that suburbanization, economics and time pressures had some effect, though he noted that average working hours had shortened. He concluded the main cause was technology "individualizing" people's leisure time via television and the Internet, suspecting that "virtual reality helmets" would carry this further in the future.
He estimated that the fall-off in civic engagement after 1965 was 10 percent due to pressure of work and double-career families, 10 percent to suburbanization, commuting, and urban sprawl, 25 percent to the expansion of electronic entertainment (especially television), and 50 percent to generational change (although he estimated that the effects of television and generational change overlapped by 10 to 15 percent). 15 to 20 percent remained unexplained.
Putnam suggested closer studies of which forms of associations could create the greatest social capital, and how various aspects of technology, changes in social equality, and public policy affect social capital. He closed by emphasizing the importance of discovering how the United States could reverse the trend of social capital decay.
The flag is: flag{JMJgHuvFdDoiGvsPWYpMv}
*/

c.add({
    id: 'substitution',
    name: 'Substitution',
    value: 50,
    description: () => `
        <p>You know that the following text was encrypted a substitution cipher with a block size of one letter. The flag is inside, can you recover it?</p>
        ${highlight(`
        Qybh Wrlrvsert, zis qyss soaxakbvsert
        Ubwkrog Tkbos: Zis Abkktvps toe Ysmrmtk bq Thsyrato Abhhjorzx rp t 2000 oboqrazrbo ubbl ux Ybusyz E. Vjzoth. Rz wtp esmskbvse qybh irp 1995 spptx sozrzkse "Ubwkrog Tkbos: Thsyrat'p Esakrorog Pbartk Atvrztk" ro zis Nbjyotk bq Eshbaytax. Vjzoth pjymsxp zis esakros bq pbartk atvrztk ro zis Jorzse Pztzsp proas 1950. Is itp espayruse zis ysejazrbo ro tkk zis qbyhp bq ro-vsypbo pbartk rozsyabjyps jvbo wirai Thsyratop jpse zb qbjoe, sejatzs, toe soyrai zis qtuyra bq zisry pbartk krmsp. Is tygjsp zitz zirp joesyhrosp zis tazrms armra sogtgshsoz wirai t pzybog eshbaytax yscjrysp qybh rzp arzrfsop.
        Vjzoth erpajppse wtxp ro wirai Thsyratop erpsogtgse qybh abhhjorzx rombkmshsoz, roakjerog esaystpse mbzsy zjyobjz, tzzsoetoas tz vjukra hsszrogp, psymras bo abhhrzzssp, toe wbyl wrzi vbkrzratk vtyzrsp. Vjzoth tkpb arzse Thsyratop' gybwrog erpzyjpz ro zisry gbmsyohsoz. Vjzoth taasvzse zis vbpprurkrzx zitz zirp ktal bq zyjpz abjke us tzzyrujzse zb "zis kbog krztox bq vbkrzratk zytgsersp toe patoetkp proas zis 1960p", ujz uskrsmse zitz zirp sdvktotzrbo wtp krhrzse wiso mrswrog rz tkbogpres bzisy "zysoep ro armra sogtgshsoz bq t wresy pbyz".
        Vjzoth obzse zis tggysgtzs kbpp ro hshusypirv toe ojhusy bq mbkjozssyp ro htox sdrpzrog armra bygtorftzrbop pjai tp yskrgrbjp gybjvp (Lorgizp bq Abkjhujp, U'otr Uyrzi, sza.), ktuby jorbop, vtysoz–zstaisy tppbartzrbop, Qsesytzrbo bq Wbhso'p Akjup, Kstgjs bq Wbhso Mbzsyp, hrkrztyx mszsytop' bygtorftzrbop, mbkjozssyp wrzi Ubx Pabjzp toe zis Yse Aybpp, toe qytzsyotk bygtorftzrbop (Krbop Akjup, Usosmbksoz toe Vybzsazrms Byesy bq Sklp, Jorzse Pztzsp Njorby Aithusy, Qysshtpboyx, Ybztyx, Lrwtorp, sza.). Vjzoth jpse ubwkrog tp to sdthvks zb rkkjpzytzs zirp; tkzibjgi zis ojhusy bq vsbvks wib ubwkse ite roaystpse ro zis ktpz 20 xstyp, zis ojhusy bq vsbvks wib ubwkse ro kstgjsp ite esaystpse. Rq vsbvks ubwkse tkbos, zisx ere obz vtyzrarvtzs ro zis pbartk rozsytazrbo toe armra erpajpprbop zitz hrgiz baajy ro t kstgjs somrybohsoz.
        Vjzoth arzsp etzt qybh zis Gsosytk Pbartk Pjymsx zitz pibwse to tggysgtzs esakros ro hshusypirv bq zyterzrbotk armra bygtorftzrbop, pjvvbyzrog irp zisprp zitz J.P. pbartk atvrztk ite esakrose. Is obzse zitz pbhs bygtorftzrbop ite gybwo, pjai tp zis Thsyrato Tppbartzrbo bq Yszryse Vsypbop, zis Prsyyt Akju, toe t vkszibyt bq htpp-hshusy tazrmrpz gybjvp. Ujz is ptre zitz zisps gybjvp ere obz zsoe zb qbpzsy qtas-zb-qtas rozsytazrbo, toe wsys zis zxvs wisys "zis bokx taz bq hshusypirv aboprpzp ro wyrzrog t aisal qby ejsp by vsyitvp baatprbotkkx ysterog t oswpkszzsy." Is tkpb eysw t erpzroazrbo uszwsso zwb erqqsysoz zxvsp bq pbartk atvrztk: t "uboerog" zxvs (wirai baajyp wrziro t eshbgytvira gybjv) toe t "uyregrog" zxvs (wirai jorzsp vsbvks qybh erqqsysoz gybjvp).
        Is ziso tplse: "Wix rp JP pbartk atvrztk syberog?" toe erpajppse psmsytk vbppruks atjpsp. Is uskrsmse zitz zis "hbmshsoz bq wbhso rozb zis wbylqbyas" toe bzisy eshbgytvira aitogsp tqqsazse zis ojhusy bq roermrejtkp sogtgrog ro armra tppbartzrbop. Is tkpb erpajppse zis "ys-vbzzrog ixvbzisprp"—zitz vsbvks usabhs kspp sogtgse wiso zisx qyscjsozkx hbms zbwop—ujz qbjoe zitz Thsyratop tazjtkkx hbmse zbwop kspp qyscjsozkx zito ro vysmrbjp esatesp. Is ere pjggspz zitz pjujyutorftzrbo, sabobhrap toe zrhs vysppjysp ite pbhs sqqsaz, zibjgi is obzse zitz tmsytgs wbylrog ibjyp ite pibyzsose. Is aboakjese zis htro atjps wtp zsaiobkbgx "roermrejtkrfrog" vsbvks'p ksrpjys zrhs mrt zsksmrprbo toe zis Rozsyosz, pjpvsazrog zitz "mryzjtk ystkrzx iskhszp" wbjke atyyx zirp qjyzisy ro zis qjzjys.
        Is spzrhtzse zitz zis qtkk-bqq ro armra sogtgshsoz tqzsy 1965 wtp 10 vsyasoz ejs zb vysppjys bq wbyl toe ebjuks-atyssy qthrkrsp, 10 vsyasoz zb pjujyutorftzrbo, abhhjzrog, toe jyuto pvytwk, 25 vsyasoz zb zis sdvtoprbo bq sksazybora sozsyztrohsoz (spvsartkkx zsksmrprbo), toe 50 vsyasoz zb gsosytzrbotk aitogs (tkzibjgi is spzrhtzse zitz zis sqqsazp bq zsksmrprbo toe gsosytzrbotk aitogs bmsyktvvse ux 10 zb 15 vsyasoz). 15 zb 20 vsyasoz yshtrose josdvktrose.
        Vjzoth pjggspzse akbpsy pzjersp bq wirai qbyhp bq tppbartzrbop abjke aystzs zis gystzspz pbartk atvrztk, toe ibw mtyrbjp tpvsazp bq zsaiobkbgx, aitogsp ro pbartk scjtkrzx, toe vjukra vbkrax tqqsaz pbartk atvrztk. Is akbpse ux shvitprfrog zis rhvbyztoas bq erpabmsyrog ibw zis Jorzse Pztzsp abjke ysmsyps zis zysoe bq pbartk atvrztk esatx.
        Zis qktg rp: qktg{NHNgIjmQeEbrGmpVWXvHm}
        `, 'text')}
    `,
    check: staticFlag('flag{JMJgHuvFdDoiGvsPWYpMv}')
})

c.add({
    id: 'two-time-pad',
    name: 'Two Time Pad',
    value: 50,
    description: () => `
        <p>If the one time pad is so good, why isn't there a one time pad 2?</p>
        <p><a href="/challenges/two-time-pad/generate-sources.js">Download generate-sources.js</a></p>
        <p><a href="/challenges/two-time-pad/generate-sources.js.enc">Download generate-sources.js.enc</a></p>
        <p><a href="/challenges/two-time-pad/flag.pdf.enc">Download flag.pdf.enc</a></p>
    `,
    check: staticFlag('flag{c8c17290-2b84-4db3-9f28-6385840455a6}')
});

// c.add({
//     id: 'cha512',
//     name: 'cha512',
//     description: () => `
//         <p>This is a Linux binary for encrypting files. You run it by doing:</p>
//         <p class="command">./cha512 < input_file > output_file</p>
//         <p><a href="/challenges/cha512/cha512">Download cha512</a></p>
//         <p>Here is an image, and then the image after getting encrypted with <code>cha512</code> and a secret key. The key is the flag.</p>
//         <p><a href="/challenges/cha512/loc_card.webp">Download loc_card.webp</a></p>
//         <p><a href="/challenges/cha512/loc_card.webp.enc">Download loc_card.webp.enc</a></p>
//         <p>Contributed by remexre.</p>
//     `,
//     value: 200,
//     check: staticFlag('flag{4d3d1d99-2e30-4821-8684-66b33763b5a6}')
// });
