#!/usr/bin/perl

use strict;
use File::Find;
use threads;

my %settings    = (
    # корневой каталог от которого начинается поиск шаблонов
    'tmplDir'       => 'lib/templates',
    # файл, в который будут сложены скомпилированные шаблоны
    'compiledFile'  => 'build/templates.js',
    # флаги компиляции по-умолчанию
    'compilerFlags' => '-m',
    # файл с хелперами
    'helpersFile'   => 'lib/js/handlebarsHelpers.js',
);

print "Compile $settings{'compiledFile'}\n";
print "You have awaken the mighty Handlebars templates compiler\n";

my @templates;
my %compiled;

# генерируем список известных хелперов
my %knownHelpers = (
    'if'     => 1,
    'unless' => 1,
    'each'   => 1
);

if (-f $settings{'helpersFile'}) {

    open(my $H, $settings{'helpersFile'}) || die "Can't open helpers file at $settings{'helpersFile'}: $!";

    while (<$H>) {
        if ($_ =~ /Handlebars\.registerHelper\(['"](.*?)['"],\s*function/) {
            $knownHelpers{$1} = 1;
        }
    }
    close $H;
}

# рекурсивно читаем каталог
find(\&gimmeSomeHandlebars, $settings{'tmplDir'});

# все файлы, которые соответствуют маске .hbs или .hbsp складываем к себе в массив
sub gimmeSomeHandlebars {
    if ($_ =~ /\.hbs(p)?$/) {
        push @templates, $File::Find::name;
    }
}

sub compile {
    my $tmpl = shift;

    print " =====> Compiling $tmpl … ";

    # читаем файл
    open(my $F, "$tmpl") || die "Can't open $tmpl : $!";
    undef $/;
    my $templateContents = <$F>;
    close $F;

    # убираем пробелы (ходят слухи, что два регэкспа быстрее, чем один сложный)
    $templateContents =~ s/^\s+//mg;
    $templateContents =~ s/\s+$//mg;
    # и переносы строк
    $templateContents =~ s/\n|\r//g;

    my $name = $tmpl;
    # отрежем путь
    $name =~ s/.*\/(.+)$/$1/;
    # отделим имя файла от расширения
    my @name = split /\./, $name;

    $name = @name[0];

    # пишем во временный файл содержимое без пробелов
    open(my $FCLEAN, ">__${name}__") || die "Can't open file __${name}__: $!";
    print $FCLEAN $templateContents;
    close $FCLEAN;

    # ищем используемые хелперы
    my @matches = split /{{#?([^>}\s]+?)\s+[^}]+}}/i, $templateContents;
    my %uniqHelpers;
    my $usingUnknownHelpers = 0;

    for (my $i = 0; $i < $#matches; $i++) {
        next if ($i % 2 == 0);
        if (!exists $knownHelpers{$matches[$i]}) {
            $usingUnknownHelpers = 1;
        } else {
            $uniqHelpers{$matches[$i]} = 1;
        }
    }

    # формируем параметры компиляции на основе найденных хелперов
    my $compilerFlags = $settings{'compilerFlags'};

    for my $helper (keys %uniqHelpers) {
        $compilerFlags .= " -k $helper";
        print " >>helper: $helper "
    }

    $compilerFlags .= ' --knownOnly' if ($usingUnknownHelpers == 0);
    print "\n";

    # компилируем шаблон
    my $res = `handlebars __${name}__ $compilerFlags` || die "Can't exec handlebars1 __${name}__ $compilerFlags";
    # подставляем правильное имя шаблона
    $res =~ s/__${name}__/$name/;

    # если у нас не просто шаблон, а хелпер, то зарегистрируем его
    if ($name[1] eq 'hbsp') {
        $res .= qq~;\nHandlebars.registerPartial("$name", Handlebars.templates["$name"])~;
    }
    $res .= ";\n";

    # удаляем временный файл
    unlink("__${name}__");
    return $res;
}

my @files;
# сгенерим список шаблонов
for my $tmpl (@templates) {
    # пропускаем файл с настройками
    next if ($tmpl eq $settings{'settingsFile'});
    push @files, $tmpl;
}

# добавим немножко магии, чтобы компилировать шаблоны в отдельных потоках
my @compilations = map {$_->join()}
    map {threads->create(sub {return compile($_)})} @files;

# запишем результат в файл
my $res = join("\n", @compilations);
if ($res !~ /^\s*$/)  {
    open(my $RES, ">$settings{'compiledFile'}") || die "Can't open $settings{'compiledFile'}: $!";
        print $RES $res;
    close $RES;
} else {
    die "$settings{'compiledFile'} is empty!";
}
