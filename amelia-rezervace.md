Dokumentace rezervačního systému (podobného Amelia)

Tento dokument popisuje funkčnost a strukturu rezervačního systému inspirovaného pluginem Amelia pro WordPress. Systém je implementován v Next.js jako webová aplikace a zpočátku počítá s jedním administrátorem (správcem) s plnými právy. Administrátor má k dispozici přehledný panel pro správu služeb, zaměstnanců, rezervací a souvisejících nastavení podobně jako v Amelia. Cílem je dosáhnout robustní funkcionality srovnatelné s pluginem Amelia, včetně plánování kapacit, zamezení dvojího rezervování téhož zaměstnance a přehledných statistik o provozu.

Uživatelské role a přístup

Administrátor – V aktuální verzi systému existuje pouze role správce. Administrátor má plný přístup ke všem funkcím: může definovat služby, spravovat zaměstnance, prohlížet a měnit rezervace, nastavovat pracovní dobu a obecná nastavení systému. (Amelia plugin rozlišuje role jako Admin, Manager, Employee, Customer; pro naše účely však zatím postačí jeden administrátor s plnými právy.)

Zaměstnanci – Zaměstnanci představují poskytovatele služeb (např. lékaři, kadeřníci, trenéři apod.). V našem systému nebudou mít vlastní přihlašovací účet (to lze případně rozšířit později), ale administrátor je eviduje v systému a přiřazuje jim služby a pracovní dobu. V pluginu Amelia je vyžadováno mít vytvořeného alespoň jednoho zaměstnance, jinak není možné rezervace přijímat
wpamelia.com
. I v našem systému tedy musí být minimálně jeden zaměstnanec, aby bylo možné nabízet služby zákazníkům.

(Poznámka: Rozšíření na více rolí – např. Zákazník pro přihlášené klienty nebo omezený přístup pro Zaměstnance – je možné v budoucnu. Zatím se však soustředíme na backend pro administrátora.)

Správa kategorií služeb

Nejprve je třeba vytvořit kategorie služeb, do nichž budou jednotlivé služby zařazeny. Plugin Amelia vyžaduje, aby každá služba náležela do nějaké kategorie – bez alespoň jedné kategorie nelze služby vytvářet
wpamelia.com
. Kategorie umožňují seskupovat příbuzné služby (např. kategorie Masáže, Kadeřnické služby, Fyzioterapie apod.), což usnadňuje organizaci ve firmách s širším portfoliem služeb.

Administrátor může přidávat nové kategorie, editovat jejich názvy a případně je mazat. Vytvoření jedné obecné kategorie je nutné i v případě, že nabízíme jen jediný typ služby (taková kategorie se pak na frontendu nemusí zobrazovat
wpamelia.com
).

Při vytváření nové služby (viz níže) je vždy vyžadeno přiřadit ji do jedné z existujících kategorií.

Správa služeb

Administrátor definuje jednotlivé služby, které si mohou zákazníci rezervovat. Každá služba má několik vlastností a nastavení:

Název služby – Krátký název vystihující nabízenou službu (např. Hodinová masáž, Střih vlasů).

Kategorie – Odkaz na kategorii, do níž služba patří (např. Masáže, Kadeřnictví). Každá služba musí mít přiřazenou kategorii
wpamelia.com
.

Popis služby – Detailnější popis, co služba obnáší (volitelné, pro informaci zákazníkům).

Délka trvání – Doba, jak dlouho služba trvá. Délka trvání je klíčová pro plánování rezervačních časových slotů
wpamelia.com
. Systém bude nabízet termíny na základě této délky a dostupnosti zaměstnanců. (Např. služba může trvat 60 minut; podle toho se vytvoří hodinové sloty v kalendáři.)

Cena – Cena za službu v definované měně. Formát ceny se řídí nastavením plateb v systému
wpamelia.com
. Lze nastavit i cenu 0, pokud jde o bezplatnou službu – v takovém případě se zákazníkům vůbec nezobrazují platební metody
wpamelia.com
.

Kapacita (min/max počet osob) – Počet osob, pro které lze službu najednou rezervovat. Výchozí je 1 (individuální rezervace), ale pokud poskytujete skupinové služby (např. lekce pro více lidí), lze nastavit vyšší kapacitu. Amelia umožňuje nastavit minimální a maximální kapacitu na jednu rezervaci
wpamelia.com
. Pokud je maximální kapacita > 1, považuje se rezervace za skupinovou – buď se mohou přihlašovat různí zákazníci jednotlivě až do naplnění kapacity, nebo jeden zákazník rezervuje více míst pro celou skupinu
wpamelia.com
.

Příprava a doba po službě (buffer) – Volitelně lze ke službě definovat časový odstup před a/nebo po rezervaci, během kterého nelze naplánovat další návaznou rezervaci
wpamelia.com
. Tento buffer čas slouží např. na přípravu pracoviště či úklid po skončení služby. Buffer před zajišťuje, že před začátkem služby má zaměstnanec vymezený čas na přípravu, buffer po pak čas po skončení, než začne případná další schůzka. Tyto časy se zákazníkovi explicitně neukazují, ale systém je bere v potaz a blokuje díky nim překrývající se sloty
wpamelia.com
.

Obrázek a barva – Ke službě lze přiřadit ilustrační fotografii (např. pro zobrazení v katalogu služeb) a barvu. Barva může sloužit pro odlišení služeb v kalendáři (tak to dělá Amelia
wpamelia.com
wpamelia.com
 – každá služba může mít svou barvu, která se pak projeví v zobrazení kalendáře).

Galerie obrázků – Rozšíření výše uvedeného; u služby může být galerie více fotografií, které se zobrazí v detailu služby na webu (tato funkcionalita je inspirovaná Amelií
wpamelia.com
).

Extra doplňky – Systém může podporovat přidání extras – doplňkových položek k službě, které si zákazník může při rezervaci přikoupit
wpamelia.com
. Např. k masáži lze nabídnout za příplatek aromaterapii (+10 min), k úklidu domácnosti může být extra služba mytí oken apod. Každý takový doplněk má svůj název, cenu a případně dodatečnou délku trvání
wpamelia.com
wpamelia.com
. Extras se sčítají k hlavní službě – jejich cena i čas se připočítá k rezervaci, pokud je zákazník zvolí.

Administrátor může služby přidávat, editovat i odstraňovat. Při vytváření služby se otevře formulář (dialog) s výše zmíněnými záložkami či sekcemi (detaily služby, nastavení ceny a délky, případně galerie a extras – podobně jako v Amelii
wpamelia.com
wpamelia.com
). Služby lze také řadit nebo filtrovat podle kategorií pro lepší přehled (zejména pokud jich bude mnoho).

Správa zaměstnanců (poskytovatelů služeb)

Zaměstnanci představují osoby či zdroje, které poskytují služby zákazníkům. Správa zaměstnanců v systému zrcadlí funkčnost pluginu Amelia – každý zaměstnanec má svůj profil s několika záložkami pro různé typy informací
wpamelia.com
:

Osobní údaje – Základní informace o zaměstnanci: jméno, příjmení, e-mail (tyto jsou povinné)
wpamelia.com
, případně telefon, fotografie, interní poznámka apod. Kontaktní údaje slouží pro komunikaci a notifikace (např. e-mail pro zasílání upozornění o rezervaci).

Přiřazené služby – Výčet všech dostupných služeb a označení, které z nich daný zaměstnanec poskytuje
wpamelia.com
wpamelia.com
. Administrátor zde přiřadí zaměstnanci konkrétní služby (např. kadeřník poskytuje střih i barvení vlasů, masér poskytuje různé druhy masáží atd.). Je možné, že pro některé služby bude mít zaměstnanec individuální nastavení – např. odlišnou cenu či kapacitu, než je výchozí u služby – Amelia to umožňuje konfigurovat
wpamelia.com
wpamelia.com
. V našem systému můžeme pro začátek předpokládat, že cena a délka jsou primárně definovány službou, ale do budoucna je možné zohlednit i individuální nastavení na úrovni zaměstnance.

Pracovní doba – Klíčová záložka určující, kdy je zaměstnanec dostupný pro poskytování služeb
wpamelia.com
. Administrátor zde nastaví pracovní rozvrh zaměstnance pro každý den v týdnu. Lze definovat více časových intervalů na den (např. 9:00–12:00 a 13:00–17:00 s polední pauzou)
wpamelia.com
. Pokud zaměstnanec v určité dny nepracuje, jednoduše nemá nastaven žádný interval. Pracovní doba přímo ovlivňuje dostupné rezervační sloty – systém nabídne zákazníkům jen časy spadající do těchto intervalů a zároveň neobsazené jinou rezervací.

Dny volna – Tato sekce umožňuje definovat výjimky, kdy zaměstnanec nepracuje, přestože by podle běžného rozvrhu měl. Typicky sem spadají dovolené, státní svátky, nemocenské atd. Dny volna mají vyšší prioritu než běžný rozvrh – pokud je např. 1. července označen jako volno, zaměstnanec nebude k dispozici ani když je to jinak jeho standardní pracovní den
wpamelia.com
. (Amelia rozlišuje globální dny volna platné pro všechny a individuální pro každého zaměstnance
wpamelia.com
; v našem systému zatím můžeme spravovat dny volna per zaměstnanec.)

Speciální dny – Opak k dnům volna. Umožňuje nastavit nestandardní výjimečný rozvrh pro konkrétní den nebo období
wpamelia.com
. Například pokud si zaměstnanec výjimečně vymění směnu, může mít v určitém týdnu odlišnou pracovní dobu; nebo jednorázově poskytuje služby i v sobotu (přestože běžně víkendy nepracuje). Speciální dny mají přednost před standardním rozvrhem (přepisují jej), ale nepřekryjí dny volna
wpamelia.com
 – tzn. pokud je den označen jako volno, speciálním dnem ho nelze „otevřít“.

Kromě výše zmíněných údajů lze zaměstnancům přiřadit další nastavení: např. lokalitu (pokud systém podporuje více poboček či míst výkonu služby), časové pásmo (pokud by zaměstnanci působili v různých časových zónách – Amelia tuto možnost má pro online služby
wpamelia.com
wpamelia.com
), či integrace s kalendáři (Google/Outlook) a komunikačními nástroji (Zoom apod.)
wpamelia.com
wpamelia.com
. Tyto integrace umožňují např. synchronizovat zaměstnancům jejich rezervace s Google kalendářem nebo automaticky generovat meetingy v Zoomu pro online služby. V první fázi však náš systém takové integrace mít nemusí; stačí vědět, že lze doplnit.

Přidání nového zaměstnance provádí administrátor přes administrátorské rozhraní (typicky tlačítko "Přidat zaměstnance"). Vyplní se zmíněné údaje (jméno, email, atd.) a nastaví rozvrh. Amelia automaticky skryje výběr zaměstnance na rezervačním formuláři, pokud je v systému jen jeden zaměstnanec
wpamelia.com
 – v našem systému můžeme udělat totéž, aby zákazník nemusel vybírat z jedné možnosti. Pokud je zaměstnanců více, systém je nabídne k výběru (pokud to dává smysl pro daný typ služby; případně lze při rezervaci vybrat "libovolný pracovník" a systém zvolí automaticky).

Vyhledávání a filtrování zaměstnanců: Při větším počtu zaměstnanců by měl admin panel umožnit filtrování podle jména, poskytované služby či místa, podobně jako to umožňuje Amelia
wpamelia.com
. Tím se usnadní správa v případě desítek pracovníků.

Rezervace (objednávky termínů)

Rezervace (Appointments) je centrálním prvkem systému – představuje dohodnutý termín, kdy určitý zákazník (nebo více zákazníků) využije vybranou službu u konkrétního zaměstnance
wpamelia.com
. Rezervační proces probíhá typicky tak, že zákazník na frontendu vybere požadovanou službu, zvolí zaměstnance (je-li na výběr) nebo pobočku, vybere z dostupných termínů a časů, vyplní své kontaktní údaje a případně provede platbu. Po potvrzení vzniká v systému záznam o nové rezervaci.

Klíčové vlastnosti jedné rezervace:

Služba – odkaz na rezervovanou službu (určuje délku, cenu, případně kapacitu).

Zaměstnanec – odkaz na zaměstnance, který službu poskytne. Systém zajišťuje, že jeden zaměstnanec nemůže mít dvě rezervace, které by se časově překrývaly
wpamelia.com
. Pokud je zaměstnanec již obsazen v daném čase, termín se pro další zájemce nabídne jako nedostupný. (Amelia to řeší tak, že obsazené hodiny + případné buffery odečte z dostupných slotů
wpamelia.com
.)

Datum a čas – konkrétní datum a čas začátku rezervace (a odvozeně čas konce podle délky služby + extras + buffery). Systém generuje dostupné časové sloty podle pracovní doby zaměstnance a délky služby. Pokud například služba trvá 1 hodinu a zaměstnanec pracuje od 9:00 do 17:00, nabídnou se sloty 9:00–10:00, 10:00–11:00 atd., vynechají se obsazené nebo nedostupné kvůli přestávkám.

Zákazník – osoba, která si službu rezervovala. Evidujeme minimálně jméno a kontaktní údaje (e-mail, telefon) pro potvrzení a komunikaci. Pokud je rezervace skupinová, může být zákazníků více; pak rozlišujeme hlavního objednatele a případné +1 osoby navíc, viz dále.

Stav rezervace – Status indikující aktuální stav domluvy. Budeme používat podobné stavy jako Amelia
wpamelia.com
wpamelia.com
:

Pending (Čeká na schválení) – nová rezervace čeká na potvrzení. V Amelia lze nastavit, zda se mají nové termíny automaticky schvalovat jako Approved či nikoli
wpamelia.com
. My můžeme implementovat volbu v nastavení: automaticky potvrdit vs. ruční schvalování.

Approved (Schválená) – potvrzená rezervace. Zákazník obdržel potvrzení a termín platí. Pokud bylo vyžadováno schválení, administrátor (případně zaměstnanec/manager) musel rezervaci změnit na tento stav.

Canceled (Zrušená zákazníkem) – rezervaci zrušil zákazník (případně administrátor na žádost zákazníka). Termín se uvolní pro případné další zájemce.

Rejected (Odmítnutá správcem) – rezervaci zrušil/odmítl poskytovatel služby. Může nastat například, pokud zaměstnanec výjimečně nemůže termín uskutečnit a správce musí rezervaci stornovat z jeho strany. Stav Rejected se od Canceled liší tím, kdo akci inicioval, ale efekt je podobný (termín se ruší)
wpamelia.com
wpamelia.com
.

(Případně lze doplnit další stavy jako No Show pro zaznamenání, že zákazník nepřišel, což Amelia také umožňuje
wpamelia.com
. Pro začátek nejsou nutné.)

Platba – informace o tom, zda a jak bylo zaplaceno (hotově na místě, online kartou, bankovním převodem atd.). Pokud integrujeme platební bránu, rezervace ponese informaci o transakci (zda byla úspěšná). Do implementace Comgate bude možné označit rezervaci jako zaplacenou či nezaplacenou. Amelia sleduje sumu platby u rezervace a umožňuje i částečné platby (zálohy)
wpamelia.com
, případně u skupinových rezervací násobí cenu dle počtu osob
wpamelia.com
 – to můžeme zohlednit později.

Skupinové rezervace: Pokud má služba kapacitu více osob, systém podporuje skupinové rezervace. Dva modely:

Individuální přihlašování – Více různých zákazníků si nezávisle na sobě rezervuje místa na stejný termín téže služby (např. cvičební lekce pro 10 lidí se postupně zaplní deseti rezervacemi různých osob). V tomto případě systém eviduje každého zákazníka zvlášť v téže události a každý může svou účast případně zrušit samostatně
wpamelia.com
.

Hromadná rezervace jedním zákazníkem – Jeden zákazník při rezervaci uvede, že přivede ještě X dalších osob (např. objedná vstupenky pro 5 lidí najednou)
wpamelia.com
. V záznamu pak figurují jako “+X” u hlavního zákazníka. Při zrušení buď ruší celou skupinu najednou, nebo by administrátor musel umenšit počet osob v rezervaci
wpamelia.com
. Náš systém může začít podporou prvního modelu (individuální rezervace do skupinového slotu), a později přidat možnost druhého modelu.

Konflikty a kolize: Systém musí při vytváření nové rezervace zkontrolovat několik věcí:

Zvolený zaměstnanec má v daném termínu nastavenou pracovní dobu a není to jeho den volna (tj. termín spadá do jeho dostupných hodin).

Zaměstnanec už nemá v daném čase jinou schválenou rezervaci. Žádné dvě schválené rezervace se nesmí zaměstnanci překrývat v čase, jinak by jednu nemohl vykonat. (Toto systém zajistí tím, že při vyhledávání volných slotů vyloučí ty časy, kde už existuje rezervace nebo i buffer čas navazující rezervace
wpamelia.com
.)

Pokud služba vyžaduje určité vybavení nebo místo, které má omezenou kapacitu (volitelně: např. jedna ordinace nemůže hostit dvě konzultace naráz), budeme případně řešit kolize i na úrovni resourců. Plugin Amelia má koncept Resources pro sdílené zdroje
wpamelia.com
. V našem prvotním systému toto zavádět nemusíme, pokud předpokládáme jeden zaměstnanec = jeden zdroj. Později lze rozšířit.

Administrátor má možnost manuálně vytvořit rezervaci (např. zákazník objedná telefonicky, tak ji admin vloží do systému) nebo upravit existující. V přehledu rezervací půjde měnit detail rezervace, zejména změnit status (schválit, zrušit atd.) nebo přiřazeného zaměstnance či čas po domluvě. V Amelia administrátor může přímo na dashboardu kliknout na “+” a přidat novou rezervaci ručně
wpamelia.com
. U nás podobně: administrátor vyplní formulář nové rezervace (zvolí zákazníka, službu, zaměstnance, čas atd.).

Stavy rezervace se mění buď v detailu, nebo pomocí rychlé nabídky. Amelia dovoluje změnit status přímo v seznamu (z rozbalovacího seznamu) nebo otevřením dialogu s detaily
wpamelia.com
. Náš systém nabídne obdobné pohodlné akce.

Kalendář (přehled rezervací)

Pro snadnou orientaci v termínech bude administrátorovi k dispozici kalendářový náhled všech rezervací. Inspirováno Amelií: ta nabízí kalendář v několika módech (měsíční, týdenní, denní, seznamový či časová osa)
wpamelia.com
.

V našem systému admin panel poskytne kalendář s minimálně těmito pohledy:

Měsíční přehled – zobrazí rezervace v kontextu celého měsíce.

Týdenní přehled – detailnější zobrazení týdne (typicky sloupce Po–Ne, řádky hodiny)
wpamelia.com
. Tento pohled bývá výchozí, umožňuje dobře vidět denní rozvrh.

Denní rozvrh – soustředí se na jeden den, užitečné pokud je rezervací hodně v rámci dne.

Seznam – chronologický seznam nadcházejících událostí.

Timeline (časová osa) – často podobné dennímu pohledu, kde na ose X je čas a na Y jednotliví zaměstnanci (nebo zdroje) s vyznačením jejich rezervací
wpamelia.com
.

Kalendář umožní filtrovat zobrazované informace – například podle zaměstnance, služby nebo lokality
wpamelia.com
. To znamená, že administrátor si může nechat zobrazit třeba jen kalendář jednoho konkrétního zaměstnance nebo jen rezervace určité služby, což pomůže v orientaci při větším objemu dat.

V kalendáři budou jednotlivé rezervace zobrazeny jako bloky obsahující základní informace: čas začátku a konce, název služby, jméno zákazníka (případně počet zákazníků u skupiny) a jméno zaměstnance
wpamelia.com
. Barevné odlišení služeb (podle nastavení barvy služby) usnadní rozlišení na pohled
wpamelia.com
. Pokud je rezervace příliš krátká na to, aby text zobrazil vše, úplné detaily se objeví po najetí kurzorem (tooltip)
wpamelia.com
.

Administrátor může přímo v kalendáři interaktivně kliknout na rezervaci pro zobrazení detailů nebo editaci. Při rušení či přesunu termínu by kalendář mohl podporovat drag-and-drop (to je volitelná vylepšující funkce – např. přetáhnout rezervaci na jiný den/čas). Minimálně však kliknutím přejdeme na detail, kde lze provést změny.

Správa zákazníků

Systém ukládá informace o zákaznících, kteří si rezervují služby. Každá nová rezervace buď vytvoří nového zákazníka v databázi (pokud se jedná o první rezervaci dané osoby), nebo přiřadí rezervaci k existujícímu zákaznickému záznamu (pokud identifikujeme, že zákazník už existuje, např. podle e-mailu).

Administrátor tak má k dispozici seznam zákazníků s jejich kontaktními údaji a historií rezervací. Typicky evidujeme:

Jméno a příjmení zákazníka.

E-mail (povinný pro zaslání potvrzení).

Telefon (volitelný, užitečný pro SMS notifikace nebo rychlý kontakt).

Historie rezervací – systém může u každého zákazníka uchovávat seznam minulých a nadcházejících rezervací, případně počty neúčastí (No Shows) apod.

Poznámky – možnost interních poznámek k zákazníkovi (např. VIP klient, zvláštní požadavky atd., neveřejné).

Ve výchozí verzi neplánujeme, že by se zákazníci sami registrovali a spravovali účet (v Amelii existuje Front-end Customer Panel pro klienty
wpamelia.com
). Zprvu stačí, že administrátor či systém založí záznam automaticky při rezervaci. Do budoucna lze doplnit zákaznickou sekci, kde se klient po přihlášení podívá na své rezervace nebo je sám zruší.

Platební integrace

Pro komfort zákazníků i provozovatele systém podporuje online platby za rezervace. Uživatel při vytváření rezervace zvolí způsob platby dle dostupných možností:

Platba na místě (hotově) – Zákazník nezaplatí online, uhradí službu fyzicky při jejím poskytnutí. Tuto možnost lze v systému povolit jako jednu z platebních metod. Pokud jsou všechny online metody vypnuté, platba na místě se bere jako výchozí způsob
wpamelia.com
.

Online platba kartou / převodem – Integrace s platební bránou Comgate umožní zákazníkům zaplatit rezervaci okamžitě online (kartou, rychlým převodem, Apple/Google Pay atd., dle nabídky Comgate). Comgate bude napojené přes API; po vytvoření rezervace bude uživatel přesměrován na platební bránu a po úspěšné platbě se rezervace označí jako zaplacená. (Implementace zahrnuje i obsluhu notifikací z brány o úspěchu platby.)

Další platební metody – Systém lze navrhnout modulárně, aby bylo snadné přidat i jiné brány nebo metody. Plugin Amelia například podporuje PayPal, Stripe, Mollie, Razorpay a další platební metody
wpamelia.com
wpamelia.com
. V našem systému se zaměříme na Comgate, ale návrh počítá s rozšířením – např. PayPal integrace by znamenala umožnit platbu PayPalem či kartou přes PayPal účet (v Amelii stačí zadat Client ID a Secret od PayPalu a zapnout službu
wpamelia.com
), Stripe integrace obdobně vyžaduje klíče API
wpamelia.com
. Tyto brány typicky umožňují testovací režim (sandbox) i produkční režim.

Administrátor v administrační sekci bude mít nastavení plateb (obdoba Payments Settings v Amelia). Tam lze zvolit měnu a formát měny, aktivovat či deaktivovat jednotlivé platební metody a vyplnit potřebné přihlašovací údaje (API klíče, identifikátory obchodníka apod.). Lze také povolit zadávání slevových kupónů na rezervace
wpamelia.com
, definovat výši zálohy (pokud nevyžadujeme platbu 100% předem) atd. – tyto funkce můžeme postupně doplňovat.

Veškeré transakce by se měly propisovat do systému tak, aby administrátor viděl, které rezervace jsou zaplacené a jakým způsobem. S tím souvisí i modul Financí (viz dále statistiky).

Notifikace (e-mail/SMS komunikace)

Důležitou součástí rezervačního systému je automatické zasílání upozornění a potvrzení různým stranám. Náš systém implementuje alespoň e-mailové notifikace, podobně jako Amelia:

Potvrzení rezervace zákazníkovi – Jakmile si zákazník vytvoří rezervaci, obdrží e-mail s potvrzením termínu, detailů služby, ceny a případně platebního statusu. Pokud je zapnut režim ručního schvalování (Pending), může nejprve dostat zprávu „rezervace přijata, čeká na potvrzení“ a následně po schválení druhý e-mail o potvrzení.

Upozornění zaměstnanci – Když přibude rezervace (zejména schválená) v kalendáři zaměstnance, měl by o tom být informován. Systém tedy zašle e-mail i danému zaměstnanci s podrobnostmi (datum, čas, služba, zákazník). Amelia například umožňuje zasílat oznámení zaměstnanci při vytvoření rezervace, jejím schválení či zrušení
wpamelia.com
wpamelia.com
.

Změny a zrušení – Při změně stavu rezervace systém rozešle příslušné notifikace. Např. pokud administrátor zruší rezervaci (Rejected), zákazník dostane e-mail o zrušení a případně instrukce k dalšímu postupu (vrácení platby atd.), zaměstnanec také dostane informaci
wpamelia.com
. Pokud zákazník rezervaci zruší sám (umožníme-li mu to třeba prostřednictvím odkazu v e-mailu nebo přes zákaznický účet), zaměstnanec i admin obdrží upozornění.

Připomínky – Lze nastavit automatické připomínací e-maily před nadcházejícím termínem (např. 24 hodin předem), aby se snížilo riziko, že zákazník zapomene přijít.

Další kanály – Kromě e-mailů můžeme v budoucnu integrovat i SMS notifikace nebo zprávy přes WhatsApp. Amelia má podporu pro SMS a WhatsApp notifikace
wpamelia.com
 (vyžaduje to napojení na SMS bránu jako Twilio apod.). Pro náš projekt se zatím soustředíme na e-mail, což je základ, a ostatní kanály jsou možné rozšíření.

Notifikační zprávy budou templaty s možností personalizace pomocí zástupných výrazů (placeholders), obdobně jako to dělá Amelia – např. [%customer_name%], [%appointment_date%] atd. se v textu nahradí reálnými údaji
wpamelia.com
. Administrátor bude moci upravit texty e-mailů v nastavení (alespoň základní šablony pro potvrzení, zrušení, připomínku).

Administrátorský dashboard a statistiky

Pro manažerský přehled nabídne systém hlavní nástěnku (dashboard) shrnující důležité statistiky o chodu rezervačního systému. Podobně jako Amelia rozdělíme dashboard na několik sekcí
wpamelia.com
:

Souhrnné metriky – V horní části přehledu se zobrazí několik klíčových ukazatelů za zvolené období (např. filtr za posledních 7 dní, tento měsíc apod.):

Počet rezervací – Celkový počet schválených (a/nebo uskutečněných) rezervací v daném období
wpamelia.com
. Amelia zobrazuje počet schválených rezervací a pod tím graf rozložení po dnech
wpamelia.com
. U nás můžeme uvést číslo a trend oproti předchozímu období.

Vytíženost (procento využití kapacity) – Ukazuje, jaká část dostupného času zaměstnanců byla zaplněna rezervacemi
wpamelia.com
. Vypočte se jako poměr odpracovaných hodin (skrze rezervace) ku celkové pracovní době všech zaměstnanců. Tento ukazatel pomáhá vidět, jak efektivně jsou kapacity využity.

Tržby – Celková suma přijatých plateb za rezervace v daném období
wpamelia.com
. Po integraci plateb bude systém sledovat uhrazené částky. Graficky lze zobrazit vývoj tržeb po dnech.

Případně další metriky jako počet nových zákazníků apod.

Detail podle zaměstnanců/služeb – Druhá část může být tabulka rozpadávající výše uvedené údaje na jednotlivé zaměstnance nebo služby
wpamelia.com
. Např. pro každého zaměstnance zobrazit počet rezervací, odpracované hodiny, vydělanou částku a vytížení
wpamelia.com
. To samé pro každou službu: kolikrát byla objednána, kolik přinesla peněz, kolik hodin bylo poskytnuto. Tabulku bude možné řadit podle jednotlivých sloupců (např. seřadit služby podle tržeb, aby bylo vidět, která je nejvýdělečnější)
wpamelia.com
.

Nadcházející rezervace – Třetí sekce ukáže přehled nejbližších nadcházejících termínů (např. následujících 10 rezervací)
wpamelia.com
. U každé položky budou uvedeny detaily: datum a čas, zákazník, služba, zaměstnanec, stav rezervace a způsob platby
wpamelia.com
. Administrátor může z tohoto seznamu rychle provádět akce – třeba změnit status rezervace pomocí rozbalovací nabídky (schválit, zrušit) nebo kliknout na Editovat pro úpravu detailů
wpamelia.com
. Pokud je rezervace již v minulosti, editace nebude možná (to Amelia indikuje zašedlým tlačítkem
wpamelia.com
). U seznamu může být i tlačítko Export pro stažení seznamu dnešních (nebo všech) rezervací do CSV
wpamelia.com
.

Grafy a analýzy – Dolní část dashboardu může obsahovat vizualizace pro lepší pochopení trendů:

Zájmy vs. konverze – Amelia zobrazuje sloupcové grafy srovnávající počet otevření rezervačního formuláře (zájem) s počtem skutečně vytvořených rezervací (konverze) pro jednotlivé zaměstnance, služby, případně lokality
wpamelia.com
wpamelia.com
. Tato metrika pomáhá identifikovat, kde zákazníci často zvažují rezervaci, ale nedokončí ji (možná problém s dostupností termínů či cenou?). V našem systému můžeme podobný graf přidat, pokud budeme sledovat i neúspěšné pokusy o rezervaci. Zpočátku nemusí být priorita.

Noví vs. vracející se zákazníci – Koláčový graf ukazující podíl nových klientů vůči těm, kteří už u nás v minulosti rezervaci měli
wpamelia.com
. Toto poskytuje rychlý přehled o loajalitě zákazníků.

Další grafy dle potřeby (např. nejpopulárnější služby, špičky vytíženosti v čase atd.).

Všechny tyto statistiky budou filtrovatelné dle období. Nástroj pro výběr data/období bude nahoře na dashboardu – například možnost rychlé volby tento týden, tento měsíc, posledních 30 dní apod., případně vlastní interval
wpamelia.com
. Po změně filtru se údaje přepočítají pro zvolené období.

Dashboard by měl sloužit jako úvodní stránka administrace, kde správce vidí aktuální stav podnikání: kolik má dnes klientů, jak se daří tento týden oproti minulému, kteří zaměstnanci nebo služby jsou nejvíce vytíženi, a tak podobně
wpamelia.com
.

Závěr

Výše popsaný systém poskytuje komplexní funkcionalitu rezervačního systému po vzoru Amelia pluginu. Zahrnuje správu služeb s podrobnými nastaveními, přiřazení zaměstnanců a plánování jejich kapacit, robustní zpracování rezervací (včetně skupinových), integraci plateb a notifikací, a přehledný administrátorský panel s důležitými statistikami. Tato dokumentace bude sloužit jako podklad pro implementaci systému (např. pomocí AI asistenta typu Claude Code či vývojářského týmu) a zajišťuje, že výsledný rezervační systém bude funkčně bohatý a škálovatelný pro budoucí rozšíření, stejně jako ověřené řešení Amelia.

Zdroj inspirace:
V mnoha bodech vycházíme z funkcionality a osvědčených postupů Amelia WordPress Booking pluginu
wpamelia.com
wpamelia.com
, což zaručuje promyšlenost a praktičnost navrženého systému. S implementací těchto prvků v prostředí Next.js budeme schopni dodat moderní a spolehlivé řešení pro online rezervace